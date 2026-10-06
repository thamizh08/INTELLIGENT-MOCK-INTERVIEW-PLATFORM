// src/components/roadmap/VideoPreviewModal.jsx
// Lightweight, theme-adaptive modal to preview YouTube video lectures & mentor courses.

import React, { useEffect } from 'react';
import Button from '../common/Button';

function VideoPreviewModal({ isOpen, onClose, resource }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resource) return null;

  // Check if direct YouTube video embed ID exists
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const matchWatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (matchWatch) {
      return `https://www.youtube.com/embed/${matchWatch[1]}?autoplay=1`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(resource.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-theme-border bg-theme-surface shadow-2xl overflow-hidden animate-scale-up"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px var(--glow-accent)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-card/60">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold font-mono">
              ▶
            </span>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                MENTOR VIDEO LECTURE
              </span>
              <h3 className="font-display text-base font-bold text-theme-text line-clamp-1">
                {resource.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-theme-muted hover:text-theme-text hover:bg-theme-card transition-colors font-mono text-lg"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {embedUrl ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-theme-border bg-black">
              <iframe
                src={embedUrl}
                title={resource.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-theme-border bg-theme-card/40 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl">
                📺
              </div>
              <h4 className="font-display text-lg font-bold text-theme-text">
                {resource.title}
              </h4>
              <p className="text-xs text-theme-secondary max-w-md mx-auto">
                {resource.description || 'Curated senior engineering lecture session and conceptual breakdown.'}
              </p>

              {/* Meta tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-theme-surface border border-theme-border text-theme-accent font-semibold">
                  🎙 {resource.channelOrAuthor || 'Curated Mentor'}
                </span>
                <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-theme-surface border border-theme-border text-theme-muted">
                  ⏱ {resource.duration || '45 mins'}
                </span>
                <span
                  className={`font-mono text-[11px] px-2.5 py-1 rounded font-bold ${
                    resource.subscriptionStatus === 'Paid'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {resource.subscriptionStatus === 'Paid' ? '💎 Paid Subscription' : '🟢 Free / Unpaid (YouTube)'}
                </span>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl border border-theme-border bg-theme-card/30 text-xs text-theme-secondary space-y-2">
            <div className="font-mono text-[10px] text-theme-accent uppercase font-bold tracking-wider">
              MENTORSHIP STUDY TIP
            </div>
            <p>
              Watch actively with code editor open. Recreate the architectural diagrams and pause when the mentor discusses failure modes or performance bottlenecks.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-theme-border bg-theme-card/60">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Close
          </Button>
          <a
            href={resource.url || 'https://www.youtube.com'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="cyan" className="text-xs py-2 px-4 shadow-lg flex items-center gap-2">
              <span>Open on {resource.platform || 'YouTube'}</span>
              <span className="text-sm">↗</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default VideoPreviewModal;
