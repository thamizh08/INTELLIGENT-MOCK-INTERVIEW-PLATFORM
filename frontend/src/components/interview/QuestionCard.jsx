// src/components/interview/QuestionCard.jsx
// Professional assessment question card tailored for formal online learning & interview evaluation.

function QuestionCard({ questionText, order, isFollowUp }) {
  return (
    <div className="card-formal relative rounded-2xl p-6 sm:p-8 overflow-hidden shadow-lg border border-theme-border bg-theme-surface">
      {/* Top accent border line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <span
          className="font-mono text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-2"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent)',
            color: 'var(--accent-primary)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          />
          Question {order}{' '}
          {isFollowUp && (
            <span style={{ color: 'var(--accent-secondary)' }} className="ml-1 font-bold">
              · Follow-up Probe
            </span>
          )}
        </span>
        <span className="font-mono text-[11px] text-theme-muted uppercase tracking-wider font-semibold">
          TECHNICAL EVALUATION
        </span>
      </div>

      <h2 className="font-display text-xl sm:text-2xl text-theme-text font-bold leading-relaxed tracking-tight">
        {questionText}
      </h2>
    </div>
  );
}

export default QuestionCard;

