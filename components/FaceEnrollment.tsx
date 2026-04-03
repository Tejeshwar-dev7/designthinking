'use client';

import { useRef, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { loadModels, averageDescriptors } from '@/lib/faceApi';
import { createClient } from '@/lib/supabase/client';
import { saveOrUpdateFaceEmbedding } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

interface FaceEnrollmentProps {
  profileId: string;
  hasExisting: boolean;
  returnUrl?: string;
}

export function FaceEnrollment({ profileId, hasExisting, returnUrl = '/dashboard' }: FaceEnrollmentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [captures, setCaptures] = useState<Float32Array[]>([]);
  const [status, setStatus] = useState(hasExisting ? 'existing' : 'idle');
  const [message, setMessage] = useState(
    hasExisting ? 'You already have a face registered.' : 'Get ready to scan your face.'
  );
  
  const TARGET = 8;
  const router = useRouter();

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function startCamera() {
    try {
      setStatus('loading');
      setMessage('Loading AI Models (this might take a few seconds)...');
      await loadModels();
      
      setMessage('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setCaptures([]);
      setStatus('capturing');
      setMessage('Look straight at the camera and click Capture.');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Failed to access camera.');
    }
  }

  async function captureSnapshot() {
    if (!videoRef.current || status !== 'capturing') return;
    
    setMessage('Detecting face...');
    const det = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!det) { 
      setMessage('No face detected. Please adjust lighting and face the camera fully.'); 
      return; 
    }
    
    const newCaptures = [...captures, det.descriptor];
    setCaptures(newCaptures);
    
    if (newCaptures.length < TARGET) {
      const prompts = [
        "Slightly look LEFT", "Slightly look RIGHT", "Slightly look UP", 
        "Slightly look DOWN", "Smile gently", "Neutral face", "Blink once"
      ];
      setMessage(`${newCaptures.length}/${TARGET} Captured! Next: ${prompts[(newCaptures.length - 1) % prompts.length]}`);
    } else {
      setMessage('Processing average descriptors...');
      await saveDescriptor(newCaptures);
    }
  }

  async function saveDescriptor(finalCaptures: Float32Array[]) {
    setStatus('saving');
    const avg = averageDescriptors(finalCaptures);
    const descriptorArray = Array.from(avg);

    // Use Service Role Server Action to bypass RLS — critical for Kiosk orphan profiles!
    const { error } = await saveOrUpdateFaceEmbedding(profileId, descriptorArray, finalCaptures.length);

    if (error) {
      console.error(error);
      setStatus('error');
      setMessage('Failed to save to database. ' + error);
      return;
    }
    
    // Stop camera
    if (videoRef.current && videoRef.current.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach((track) => track.stop());
    }
    
    setStatus('done');
    setMessage('Face enrollment successfully complete!');
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow border border-gray-100 flex flex-col items-center text-center space-y-6">
      
      <div className="relative overflow-hidden bg-gray-900 rounded-xl w-[320px] h-[240px] md:w-[640px] md:h-[480px] shadow-inner flex items-center justify-center">
         {status === 'idle' || status === 'existing' ? (
            <div className="text-gray-400 font-medium">Camera Offline</div>
         ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              className={`absolute top-0 left-0 w-full h-full object-cover ${(status === 'saving' || status === 'done') ? 'opacity-50 blur-sm' : ''}`}
              style={{ transform: 'scaleX(-1)' }} // Mirror the video for natural feel
            />
         )}
      </div>

      <div className="text-lg font-medium text-gray-700 min-h-[3rem] px-4">
        {message}
      </div>

      <div className="w-full max-w-md bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className="bg-indigo-600 h-3 rounded-full transition-all duration-300" 
          style={{ width: `${(captures.length / TARGET) * 100}%` }}
        ></div>
      </div>

      <div className="flex gap-4">
        {(status === 'idle' || status === 'existing' || status === 'done' || status === 'error') && (
          <button
            onClick={startCamera}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all font-medium"
          >
            {status === 'existing' || status === 'done' ? 'Re-Enroll Face' : 'Start Camera'}
          </button>
        )}

        {status === 'capturing' && (
          <button
            onClick={captureSnapshot}
            className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all focus:ring-4 focus:ring-blue-100 font-medium"
          >
            Take Snapshot ({captures.length}/{TARGET})
          </button>
        )}

        {status === 'done' && (
          <button
            onClick={() => router.push(returnUrl)}
            className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all"
          >
            Finish & Continue
          </button>
        )}
      </div>
    </div>
  );
}
