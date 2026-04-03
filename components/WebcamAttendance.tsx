'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { loadModels } from '@/lib/faceApi';
import { getStudentDirectory, markStudentAttendance, getFaceEmbeddings } from '@/app/admin/actions';

type Status = 'loading' | 'ready' | 'error';

interface Props {
  sessionId: string;
  classId: string;
  onAttendanceMarked?: (studentName: string) => void;
}

export function WebcamAttendance({ sessionId, classId, onAttendanceMarked }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const loopRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const markedSet = useRef(new Set<string>());
  const nameMapRef = useRef<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('loading');
  const [faceCount, setFaceCount] = useState(0);
  const [profilesLoaded, setProfilesLoaded] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const [markedStudents, setMarkedStudents] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setDebugInfo('Loading AI models...');
        await loadModels();
        if (!mounted) return;
        setDebugInfo('Starting camera...');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });

        if (!mounted || !videoRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          // AbortError is harmless — happens when component unmounts during play()
          if (playErr.name !== 'AbortError') throw playErr;
          return;
        }

        if (!mounted) return;
        setDebugInfo('Fetching face embeddings from database...');

        // Fetch ALL enrolled descriptors — Service Role key bypasses RLS
        const data = await getFaceEmbeddings();
        if (!mounted) return;
        setDebugInfo(`Fetched ${data.length} embedding(s). Building matcher...`);

        const dir = await getStudentDirectory();
        if (!mounted) return;
        nameMapRef.current = dir.reduce((acc: Record<string, string>, obj: any) => {
          acc[obj.id] = obj.full_name;
          return acc;
        }, {} as Record<string, string>);

        if (data?.length) {
          const labeled = data.map((r: any) =>
            new faceapi.LabeledFaceDescriptors(
              r.profile_id as string,
              [new Float32Array(r.descriptor)]
            )
          );
          // 0.65 — lenient threshold for lighting/angle variation
          matcherRef.current = new faceapi.FaceMatcher(labeled, 0.65);
          setProfilesLoaded(labeled.length);
          setDebugInfo(`Matcher ready — ${labeled.length} profile(s) loaded. Camera active!`);
        } else {
          setDebugInfo('NO embeddings found! Re-enroll all students from the Admin portal first.');
        }
        if (mounted) setStatus('ready');
      } catch (e: any) {
        console.error(e);
        if (mounted) {
          setDebugInfo(`Error: ${e?.message}`);
          setStatus('error');
        }
      }
    }
    init();
    return () => {
      mounted = false;
      clearTimeout(loopRef.current);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const detect = useCallback(async () => {
    const video   = videoRef.current;
    const canvas  = canvasRef.current;
    const matcher = matcherRef.current;
    if (!video || !canvas) return;

    const dims = { width: 640, height: 480 };
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }))
      .withFaceLandmarks(true)
      .withFaceDescriptors();

    faceapi.matchDimensions(canvas, dims);
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 640, 480);
    const resized = faceapi.resizeResults(detections, dims);
    setFaceCount(detections.length);

    if (matcher && resized.length > 0) {
      for (const det of resized) {
        const match = matcher.findBestMatch(det.descriptor);
        const dist  = match.distance.toFixed(3);
        const label = match.label;

        // Live debug line — every frame
        setDebugInfo(
          label !== 'unknown'
            ? `Matched: ${nameMapRef.current[label] || label} — dist: ${dist} (threshold: 0.65)`
            : `Unknown face — best dist: ${dist} (need < 0.65 to match. Re-enroll if too high)`
        );

        const displayName = label !== 'unknown'
          ? `${nameMapRef.current[label] || 'Student'} (${Math.round((1 - match.distance) * 100)}%)`
          : `Unknown (dist: ${dist})`;

        const box = new faceapi.draw.DrawBox(det.detection.box, {
          label: displayName,
          boxColor: label !== 'unknown' ? 'rgba(74, 222, 128, 1)' : 'rgba(239, 68, 68, 1)',
          drawLabelOptions: { fontColor: '#ffffff' }
        });
        box.draw(canvas);

        if (label !== 'unknown' && !markedSet.current.has(label)) {
          markedSet.current.add(label);
          const name = nameMapRef.current[label] || `Student (${label.slice(0, 8)})`;
          const success = await markStudentAttendance({
            profile_id: label,
            class_id: null,
            session_id: sessionId,
            confidence_score: +(1 - match.distance).toFixed(3)
          });
          if (success) {
            // Only show in UI if the profile still exists and was logged
            setMarkedStudents(prev => [...prev, name]);
            onAttendanceMarked?.(name);
          } else {
            // Profile was deleted — remove from matcher so it won't match again
            setDebugInfo(`Profile "${name}" no longer exists — skipped.`);
          }
        }
      }
    } else if (detections.length === 0) {
      setDebugInfo(`${profilesLoaded} profile(s) loaded — watching for faces...`);
    }

    loopRef.current = setTimeout(detect, 66);
  }, [sessionId, classId, profilesLoaded, onAttendanceMarked]);

  useEffect(() => {
    if (status === 'ready') detect();
    return () => clearTimeout(loopRef.current);
  }, [status, detect]);

  return (
    <div className="flex flex-col items-center gap-4">
      {status === 'loading' && (
        <p className="text-blue-600 font-medium animate-pulse">Initializing Camera & Models...</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-center font-medium">Failed to load camera or AI models.</p>
      )}

      <div style={{ position: 'relative', width: 640, height: 480 }} className="rounded-xl overflow-hidden shadow-xl bg-gray-900">
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ position: 'absolute', width: 640, height: 480, transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', width: 640, height: 480, transform: 'scaleX(-1)' }}
        />
        {/* Face count */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,0,0,0.7)', color: '#fff',
          fontSize: 13, padding: '5px 10px', borderRadius: 16,
          backdropFilter: 'blur(4px)'
        }}>
          {faceCount === 0 ? '👁 Watching...' : `${faceCount} face${faceCount !== 1 ? 's' : ''} in view`}
        </div>
        {/* Profiles loaded indicator */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: profilesLoaded > 0 ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
          color: '#fff', fontSize: 13, padding: '5px 10px', borderRadius: 16,
        }}>
          {profilesLoaded} profile{profilesLoaded !== 1 ? 's' : ''} loaded
        </div>
      </div>

      {/* Live debug bar */}
      <div className="w-full max-w-2xl bg-gray-900 text-green-400 font-mono text-xs px-4 py-2 rounded-lg border border-gray-700 min-h-[32px]">
        {debugInfo}
      </div>

      {/* Marked present chips */}
      {markedStudents.length > 0 && (
        <div className="w-full max-w-2xl bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-green-800 uppercase tracking-widest mb-2">Marked Present This Session</p>
          <div className="flex flex-wrap gap-2">
            {markedStudents.map((name, i) => (
              <span key={i} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full border border-green-200">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-center bg-gray-50 p-5 rounded-xl border border-gray-100 max-w-2xl w-full">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">Live Session Active</h3>
        <p className="text-gray-500 text-sm">
          The camera matches faces in real-time against stored biometric templates.
          Confirmed matches are recorded instantly to the database.
        </p>
      </div>
    </div>
  );
}
