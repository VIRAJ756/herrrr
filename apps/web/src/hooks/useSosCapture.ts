export interface SOSEvidence {
  photoUrl?: string;
  audioUrl?: string;
  location: { lat: number; lng: number };
  timestamp: string;
}

export async function captureSOSEvidence(
  location: { lat: number; lng: number }
): Promise<SOSEvidence> {
  const evidence: SOSEvidence = {
    location,
    timestamp: new Date().toISOString(),
  };

  // ── PHOTO ──────────────────────────────────────────────
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'user' }, width: 640, height: 480 },
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();

    // Wait 1.5s for camera sensor to expose properly
    await new Promise(r => setTimeout(r, 1500));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')!.drawImage(video, 0, 0);

    evidence.photoUrl = canvas.toDataURL('image/jpeg', 0.85);
    stream.getTracks().forEach(t => t.stop());
    video.remove();
  } catch (e) {
    console.warn('Photo capture failed:', e);
  }

  // ── AUDIO ──────────────────────────────────────────────
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    evidence.audioUrl = await new Promise<string>((resolve, reject) => {
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        resolve(URL.createObjectURL(blob));
      };

      recorder.onerror = () => reject(new Error('Recorder error'));

      recorder.start(200);
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, 10000);
    });
  } catch (e) {
    console.warn('Audio capture failed:', e);
  }

  return evidence;
}

export interface EvidenceUploadResult {
  evidencePageUrl: string;
  photoUrl: string | null;
  audioUrl: string | null;
  token: string;
}

export async function uploadEvidence(
  evidence: SOSEvidence
): Promise<EvidenceUploadResult | null> {
  try {
    const formData = new FormData();

    // Photo: convert base64 dataURL → blob → File
    if (evidence.photoUrl && evidence.photoUrl.startsWith('data:')) {
      const res = await fetch(evidence.photoUrl);
      const blob = await res.blob();
      formData.append('photo', new File([blob], 'sos-photo.jpg', { type: 'image/jpeg' }));
    }

    // Audio: convert blob URL → File
    if (evidence.audioUrl && evidence.audioUrl.startsWith('blob:')) {
      const res = await fetch(evidence.audioUrl);
      const blob = await res.blob();
      formData.append('audio', new File([blob], 'sos-audio.webm', { type: 'audio/webm' }));
    }

    formData.append('lat', evidence.location.lat.toString());
    formData.append('lng', evidence.location.lng.toString());
    formData.append('timestamp', evidence.timestamp);

    const res = await fetch('http://localhost:4000/api/evidence', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  } catch (err) {
    console.error('Evidence upload failed:', err);
    return null;
  }
}
