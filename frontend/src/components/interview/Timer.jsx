// src/components/interview/Timer.jsx
// Digital LED-style countdown timer — adaptive across all four themes.

import { useState, useEffect } from 'react';

function Timer({ seconds = 120, resetKey, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [resetKey, seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isLow = timeLeft <= 20;

  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-xs font-bold px-3 py-1.5 rounded border transition-all duration-300 ${
        isLow ? 'animate-pulse' : ''
      }`}
      style={{
        borderColor: isLow ? 'var(--accent-secondary)' : 'color-mix(in srgb, var(--accent-primary) 40%, transparent)',
        color: isLow ? 'var(--accent-secondary)' : 'var(--accent-primary)',
        backgroundColor: isLow
          ? 'color-mix(in srgb, var(--accent-secondary) 15%, transparent)'
          : 'var(--bg-surface)',
        boxShadow: isLow
          ? '0 0 12px var(--glow-secondary)'
          : '0 0 10px var(--glow-accent)',
      }}
    >
      <span
        className={`w-2 h-2 rounded-full ${isLow ? '' : ''}`}
        style={{
          backgroundColor: isLow ? 'var(--accent-secondary)' : 'var(--accent-primary)',
          boxShadow: isLow
            ? '0 0 8px var(--accent-secondary)'
            : '0 0 8px var(--accent-primary)',
        }}
      />
      <span>{minutes}:{secs.toString().padStart(2, '0')}</span>
    </div>
  );
}

export default Timer;
