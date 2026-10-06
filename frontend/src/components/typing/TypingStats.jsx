// src/components/typing/TypingStats.jsx
// Real-time stats panel for the typing practice engine.

function TypingStats({ wpm, accuracy, correctChars, incorrectChars, totalChars, timeRemaining, totalTime, isActive, isFinished }) {
  const timePercent = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  const wpmColor =
    wpm >= 60 ? 'text-emerald-400' : wpm >= 40 ? 'text-amber-400' : wpm > 0 ? 'text-rose-400' : 'text-theme-muted';
  const accuracyColor =
    accuracy >= 95 ? 'text-emerald-400' : accuracy >= 80 ? 'text-amber-400' : accuracy > 0 ? 'text-rose-400' : 'text-theme-muted';

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* WPM */}
      <div className="glass-card rounded-xl p-4 text-center animate-slide-up stagger-1">
        <div className="font-mono text-[10px] text-theme-muted uppercase tracking-wider mb-1">WPM</div>
        <div className={`font-display text-3xl font-extrabold ${wpmColor} transition-colors duration-300`}>
          {isActive || isFinished ? wpm : '—'}
        </div>
        <div className="font-mono text-[9px] text-theme-muted mt-1">words / min</div>
      </div>

      {/* Accuracy */}
      <div className="glass-card rounded-xl p-4 text-center animate-slide-up stagger-2">
        <div className="font-mono text-[10px] text-theme-muted uppercase tracking-wider mb-1">Accuracy</div>
        <div className={`font-display text-3xl font-extrabold ${accuracyColor} transition-colors duration-300`}>
          {isActive || isFinished ? `${accuracy}%` : '—'}
        </div>
        <div className="font-mono text-[9px] text-theme-muted mt-1">
          {correctChars}
          <span className="text-emerald-400/60"> ✓ </span>
          {incorrectChars}
          <span className="text-rose-400/60"> ✗</span>
        </div>
      </div>

      {/* Characters */}
      <div className="glass-card rounded-xl p-4 text-center animate-slide-up stagger-3">
        <div className="font-mono text-[10px] text-theme-muted uppercase tracking-wider mb-1">Chars</div>
        <div className="font-display text-3xl font-extrabold text-theme-accent transition-colors duration-300">
          {totalChars}
        </div>
        <div className="font-mono text-[9px] text-theme-muted mt-1">typed total</div>
      </div>

      {/* Timer */}
      <div className="glass-card rounded-xl p-4 text-center animate-slide-up stagger-4">
        <div className="font-mono text-[10px] text-theme-muted uppercase tracking-wider mb-1">Time</div>
        <div className={`font-display text-3xl font-extrabold ${timeRemaining <= 10 && isActive ? 'text-rose-400 animate-pulse' : 'text-theme-text'} transition-colors duration-300`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="mt-2">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${timePercent}%`, transition: 'width 1s linear' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypingStats;
