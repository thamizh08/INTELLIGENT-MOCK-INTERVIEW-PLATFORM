// src/components/report/ReportSummary.jsx
// Executive report summary card with offer probability badge, summary text, and top improvement focus areas.

function ReportSummary({ summaryText, weakAreas, likelihoodOfPassing, topImprovementTopics }) {
  return (
    <div className="relative rounded-xl p-6 sm:p-8 border border-theme-border bg-theme-surface/95 shadow-xl overflow-hidden space-y-5">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-accent via-purple-500 to-emerald-500" />
      
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-theme-text font-bold tracking-wide flex items-center gap-2">
          <span className="text-theme-accent">⚡</span> Hiring Committee Evaluation Summary
        </h2>
        <span className="font-mono text-xs text-emerald-400 font-bold px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40">
          🏆 {likelihoodOfPassing || '85% (High Offer Probability)'}
        </span>
      </div>

      <p className="font-sans text-sm sm:text-base leading-relaxed text-theme-text bg-theme-card/60 p-4 rounded-lg border border-theme-border/50">
        {summaryText}
      </p>

      {(weakAreas?.length > 0 || topImprovementTopics?.length > 0) && (
        <div className="pt-4 border-t border-theme-border">
          <p className="font-mono text-xs text-amber-400 uppercase tracking-wider mb-3 font-semibold flex items-center gap-1.5">
            <span>⚠️</span> Key Topics to Improve Before Your Next Interview:
          </p>
          <div className="flex flex-wrap gap-2">
            {(topImprovementTopics?.length ? topImprovementTopics : weakAreas).map((area) => (
              <span
                key={area}
                className="text-xs font-mono px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-400 bg-amber-500/15 font-medium shadow-sm"
              >
                🎯 {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportSummary;
