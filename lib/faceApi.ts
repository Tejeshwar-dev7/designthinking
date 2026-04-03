import * as faceapi from '@vladmandic/face-api';

let loaded = false;

export async function loadModels(): Promise<void> {
  if (loaded) return;
  const MODEL_URL = '/models'; // Served from public/models/
  
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  loaded = true;
}

export function averageDescriptors(
  descriptors: Float32Array[]
): Float32Array {
  if (descriptors.length === 0) return new Float32Array(128);
  const avg = new Float32Array(128);
  descriptors.forEach(d => d.forEach((v, i) => (avg[i] += v)));
  avg.forEach((_, i) => (avg[i] /= descriptors.length));
  return avg;
}
