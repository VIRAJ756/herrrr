import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface EvidenceData {
  photoUrl: string | null;
  audioUrl: string | null;
  lat: number | null;
  lng: number | null;
  timestamp: string | null;
}

export default function EvidenceViewer() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<EvidenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`http://localhost:4000/api/evidence/${token}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-red-400 text-lg animate-pulse">🔴 Loading evidence...</div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <div>Evidence record not found or expired.</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-red-900 px-6 py-4 text-center">
        <h1 className="text-red-400 font-black text-2xl tracking-widest">TRINETRA</h1>
        <p className="text-gray-400 text-xs tracking-widest mt-1">EMERGENCY EVIDENCE RECORD</p>
      </div>

      {/* Emergency banner */}
      <div className="bg-red-900/40 border border-red-700 mx-4 mt-4 rounded-xl p-4 text-center">
        <p className="text-red-300 font-semibold text-sm">
          🔴 This evidence was captured automatically by TRINETRA during an SOS emergency.
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Photo */}
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-gray-400 text-xs font-bold tracking-widest">📸 PHOTO CAPTURE</span>
          </div>
          {data.photoUrl ? (
            <div className="relative">
              <img
                src={data.photoUrl}
                alt="Emergency Snapshot"
                crossOrigin="anonymous"
                className="w-full object-cover"
                style={{ maxHeight: '320px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'h-40 flex items-center justify-center text-gray-500 text-sm';
                    fallback.innerText = '⚠️ Photo unavailable — file may still be uploading';
                    parent.appendChild(fallback);
                  }
                }}
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                📸 Photo captured at time of emergency
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-600 text-sm">
              Camera was unavailable during emergency
            </div>
          )}
        </div>

        {/* Audio */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-gray-400 text-xs font-bold tracking-widest mb-3">🎙 AUDIO RECORDING</p>
          {data.audioUrl ? (
            <>
              <audio
                controls
                src={data.audioUrl}
                crossOrigin="anonymous"
                className="w-full rounded-lg"
                style={{ accentColor: '#ef4444' }}
              />
              <p className="text-gray-500 text-xs mt-2">10s ambient audio recorded during the emergency.</p>
            </>
          ) : (
            <p className="text-gray-600 text-sm">Microphone was unavailable during emergency</p>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <p className="text-gray-400 text-xs font-bold tracking-widest">📋 METADATA</p>
          {data.lat && data.lng && (
            <a
              href={`https://maps.google.com/?q=${data.lat},${data.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-cyan-400 hover:text-cyan-300"
            >
              <span>📍</span>
              <span className="font-mono text-sm">
                {data.lat.toFixed(6)}, {data.lng.toFixed(6)}
              </span>
            </a>
          )}
          {data.timestamp && (
            <div className="flex items-center gap-3 text-gray-400">
              <span>🕐</span>
              <span className="text-sm">
                {new Date(data.timestamp).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs pb-6">
          Evidence stored securely by TRINETRA Safety Platform
        </p>
      </div>
    </div>
  );
}
