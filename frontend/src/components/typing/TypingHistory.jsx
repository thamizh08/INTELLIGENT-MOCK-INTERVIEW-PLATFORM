// src/components/typing/TypingHistory.jsx
// Persistent session history using localStorage with personal bests and trends.

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'typing_practice_history';
const MAX_HISTORY = 20;

export function saveSession(session) {
  try {
    const history = getHistory();
    history.unshift({
      ...session,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function TypingHistory({ refreshKey }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, [refreshKey]);

  if (history.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center animate-fade-in">
        <span className="text-2xl mb-2 block">📝</span>
        <p className="font-mono text-xs text-theme-muted">
          No practice sessions yet. Complete your first typing test to start tracking progress!
        </p>
      </div>
    );
  }

  // Aggregate stats
  const bestWpm = Math.max(...history.map((h) => h.wpm));
  const avgWpm = Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length);
  const avgAccuracy = Math.round(history.reduce((s, h) => s + h.accuracy, 0) / history.length);
  const recentTrend =
    history.length >= 2 ? history[0].wpm - history[1].wpm : null;

  const AGGREGATE = [
    { label: 'Best WPM', value: bestWpm, icon: '🏆' },
    { label: 'Avg WPM', value: avgWpm, icon: '📊' },
    { label: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: '🎯' },
    {
      label: 'Trend',
      value: recentTrend !== null ? `${recentTrend > 0 ? '+' : ''}${recentTrend}` : 'N/A',
      icon: recentTrend > 0 ? '📈' : recentTrend < 0 ? '📉' : '➡️',
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Aggregate badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {AGGREGATE.map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
            <span className="text-base">{stat.icon}</span>
            <div className="font-display text-lg font-extrabold text-theme-accent mt-0.5">{stat.value}</div>
            <div className="font-mono text-[9px] text-theme-muted uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Session list */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {history.map((session, idx) => {
          const isPersonalBest = session.wpm === bestWpm;
          const wpmColor =
            session.wpm >= 60 ? 'text-emerald-400' : session.wpm >= 40 ? 'text-amber-400' : 'text-rose-400';
          const date = new Date(session.timestamp);
          const timeStr = date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={session.id}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 border transition-all duration-200 animate-slide-up ${
                isPersonalBest
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-theme-border bg-theme-surface hover:border-theme-accent'
              }`}
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[10px] text-theme-muted w-5 text-right shrink-0">
                  #{history.length - idx}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-theme-accent">{timeStr}</span>
                    <span className="font-mono text-[10px] text-theme-muted px-1.5 py-0.5 rounded bg-theme-card border border-theme-border">
                      {session.duration}s
                    </span>
                    {isPersonalBest && (
                      <span className="font-mono text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                        🏆 PB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className={`font-mono text-sm font-bold ${wpmColor}`}>{session.wpm} WPM</div>
                  <div className="font-mono text-[10px] text-theme-muted">{session.accuracy}% acc</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TypingHistory;
