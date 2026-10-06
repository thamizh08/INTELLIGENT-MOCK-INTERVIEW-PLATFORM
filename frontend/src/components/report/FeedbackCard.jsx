// src/components/report/FeedbackCard.jsx
// Adaptive human recruiter feedback card with scores, recruiter verdict, strengths, gaps, missing keywords, and sample strong answer.

function FeedbackCard({ questionText, answerText, evaluation }) {
  if (!evaluation) return null;

  return (
    <div className="rounded-xl p-5 border border-theme-border bg-theme-surface/90 shadow-md space-y-4">
      <div>
        <p className="font-mono text-xs text-theme-accent uppercase tracking-wider mb-1 font-bold">
          Question: {questionText}
        </p>
        <p className="font-body text-sm text-theme-text bg-theme-card/70 p-3 rounded-lg border border-theme-border/60 italic">
          "{answerText}"
        </p>
      </div>

      {/* Recruiter Verdict & Scores */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-theme-accent/15 border border-theme-accent/40 text-theme-accent font-bold">
            Verdict: {evaluation.recruiterVerdict || 'Hire'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-theme-card border border-theme-border text-theme-secondary">
            Signal: {evaluation.senioritySignal || 'Mid-Level'}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span>Tech Depth: <strong className="text-theme-accent">{evaluation.correctnessScore ?? 8}/10</strong></span>
          <span>Clarity: <strong className="text-emerald-400">{evaluation.clarityScore ?? 8}/10</strong></span>
          <span>Structure: <strong className="text-purple-400">{evaluation.structureScore ?? 8}/10</strong></span>
        </div>
      </div>

      {/* Recruiter Feedback */}
      <div className="p-3.5 rounded-lg bg-theme-card border-l-4 border-theme-accent text-sm text-theme-text font-sans leading-relaxed">
        <span className="font-mono text-xs text-theme-accent block font-semibold mb-1 uppercase">
          👔 Hiring Manager Feedback:
        </span>
        {evaluation.feedback}
      </div>

      {/* Missing Domain Keywords Box */}
      {evaluation.missingKeywords?.length > 0 && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
          <span className="font-mono font-bold text-rose-400 block mb-1.5 flex items-center gap-1">
            <span>🔑</span> Missing Required Technical Keywords (Marks Deducted):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {evaluation.missingKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="font-mono text-[11px] px-2 rounded border border-rose-500/40 text-rose-300 bg-rose-500/20 font-semibold"
              >
                ❌ {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sample Strong Answer Benchmark */}
      {evaluation.sampleStrongAnswer && (
        <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs">
          <span className="font-mono font-bold text-indigo-400 block mb-1 flex items-center gap-1">
            <span>⭐</span> Sample Benchmark Strong Answer:
          </span>
          <p className="text-theme-text font-sans text-xs italic leading-relaxed">
            "{evaluation.sampleStrongAnswer}"
          </p>
        </div>
      )}
    </div>
  );
}

export default FeedbackCard;
