// src/components/interview/VideoRoom.jsx
// Self-contained webcam preview panel using native getUserMedia API.
// Replaces the Agora video room – no third-party SDK required.

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * @param {boolean} enabled – mount point can disable the room (e.g. before session starts)
 */
function VideoRoom({ enabled = true }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // ── start webcam ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setJoined(true);
      } catch (err) {
        if (!cancelled) {
          console.error("[VideoRoom] getUserMedia error:", err);
          setError(
            err.name === "NotAllowedError"
              ? "Camera/mic access denied. Please allow permissions in your browser."
              : err.message || "Could not access camera/microphone."
          );
        }
      }
    }

    initMedia();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setJoined(false);
    };
  }, [enabled]);

  // ── toggle helpers ────────────────────────────────────────────────────────
  const handleToggleMic = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicOn((prev) => !prev);
  }, []);

  const handleToggleCamera = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCamOn((prev) => !prev);
  }, []);

  // ── render ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-mono text-rose-400 mt-4">
        ⚠ Camera error: {error}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            joined ? "bg-emerald-500 animate-ping" : "bg-amber-400"
          }`}
        />
        <span className="font-mono text-[10px] text-theme-muted uppercase">
          {joined ? "Camera Connected" : "Connecting camera…"}
        </span>
      </div>

      {/* Video preview */}
      <div className="relative rounded-xl overflow-hidden bg-theme-card border border-theme-border aspect-video max-w-md">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Fallback when no video yet */}
        {!joined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl select-none">🎥</span>
          </div>
        )}

        {/* Name tag */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-theme-accent/80 text-white">
            YOU
          </span>
          {!micOn && (
            <span className="text-[12px]" title="Microphone muted">
              🔇
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      {joined && (
        <div className="flex gap-2 justify-center pt-1">
          <button
            onClick={handleToggleMic}
            title={micOn ? "Mute microphone" : "Unmute microphone"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
              micOn
                ? "border-theme-border bg-theme-card text-theme-text hover:bg-theme-surface"
                : "border-rose-500/60 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
            }`}
          >
            {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
          </button>

          <button
            onClick={handleToggleCamera}
            title={camOn ? "Turn off camera" : "Turn on camera"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
              camOn
                ? "border-theme-border bg-theme-card text-theme-text hover:bg-theme-surface"
                : "border-rose-500/60 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
            }`}
          >
            {camOn ? "📷 Cam On" : "🚫 Cam Off"}
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoRoom;
