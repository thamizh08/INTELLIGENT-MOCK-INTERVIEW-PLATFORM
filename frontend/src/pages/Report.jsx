// src/pages/Report.jsx
// Performance report page featuring hiring committee summary, offer probability badge, radar breakdown chart, question logs, and roadmap CTA.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportBySession } from '../services/reportService';
import { generateRoadmap } from '../services/roadmapService';
import { getSession } from '../services/interviewService';
import ReportSummary from '../components/report/ReportSummary';
import ScoreRadarChart from '../components/report/ScoreRadarChart';
import FeedbackCard from '../components/report/FeedbackCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

function Report() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildingRoadmap, setBuildingRoadmap] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [{ report: fetchedReport }, { questions: fetchedQuestions }] = await Promise.all([
          getReportBySession(sessionId),
          getSession(sessionId),
        ]);
        setReport(fetchedReport);
        setQuestions(fetchedQuestions.filter((q) => q.answerText));
      } catch (err) {
        setError('Could not load this performance telemetry report.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  async function handleBuildRoadmap() {
    setBuildingRoadmap(true);
    try {
      await generateRoadmap(report._id, selectedPreference);
      navigate('/roadmap');
    } catch (err) {
      setError('Could not generate a roadmap right now.');
      setBuildingRoadmap(false);
    }
  }

  if (loading) return <Loader message="Analyzing performance metrics..." />;
  if (error) return (
    <div className="max-w-md mx-auto mt-20 text-center p-6 border border-rose-500/40 bg-rose-500/10 rounded-lg text-rose-400 font-mono text-sm">
      ⚠ {error}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <div className="border-b border-theme-border pb-4">
        <span className="font-mono text-[10px] text-theme-accent px-2.5 py-0.5 rounded bg-theme-accent/15 border border-theme-accent/30 uppercase font-bold">
          PERFORMANCE REPORT
        </span>
        <h1 className="font-display text-3xl font-extrabold text-theme-text mt-1">Interview Diagnostics & Hiring Decision</h1>
      </div>

      <ReportSummary
        summaryText={report.summaryText}
        weakAreas={report.weakAreas}
        likelihoodOfPassing={report.likelihoodOfPassing}
        topImprovementTopics={report.topImprovementTopics}
      />

      <div className="rounded-xl p-6 border border-theme-border bg-theme-surface/90 shadow-lg">
        <h2 className="font-display text-lg text-theme-text font-bold mb-1 flex items-center gap-2">
          <span className="text-theme-accent">📊</span> Multi-Dimensional Skill Radar
        </h2>
        <p className="font-mono text-xs text-theme-muted mb-4">Core technical and soft skill dimension breakdown (0-10)</p>
        <ScoreRadarChart overallScores={report.overallScores} />
      </div>

      <div>
        <h2 className="font-display text-xl text-theme-text font-bold mb-4 flex items-center gap-2">
          <span className="text-theme-accent">📝</span> Evaluated Question Logs & Sample Answers
        </h2>
        <div className="space-y-5">
          {questions.map((q) => (
            <FeedbackCard
              key={q._id}
              questionText={q.questionText}
              answerText={q.answerText}
              evaluation={q.evaluation}
            />
          ))}
        </div>
      </div>

      {report.weakAreas?.length > 0 && (
        <div className="rounded-2xl p-8 border border-theme-border bg-theme-surface shadow-2xl space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-[10px] text-theme-accent px-2.5 py-0.5 rounded bg-theme-accent/15 border border-theme-accent/30 uppercase font-bold tracking-wider">
              PERSONALIZED REMEDIATION
            </span>
            <h3 className="font-display text-2xl font-bold text-theme-text mt-2">
              Ready to overcome your weak spots?
            </h3>
            <p className="text-xs sm:text-sm text-theme-secondary mt-1">
              Select your preferred learning methodology to generate an optimized 7-day mastery roadmap.
            </p>
          </div>

          {/* Learning Preference Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPreference('all')}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                selectedPreference === 'all'
                  ? 'border-theme-accent bg-theme-accent/10 shadow-md ring-1 ring-theme-accent'
                  : 'border-theme-border bg-theme-card/50 hover:border-theme-border-accent'
              }`}
            >
              <div className="text-xl mb-1">🌟</div>
              <div className="font-display text-sm font-bold text-theme-text">
                360° Dual Track
              </div>
              <div className="text-[11px] text-theme-secondary mt-1 leading-relaxed">
                Balanced mix of GeeksforGeeks articles, courses, and YouTube mentor lectures.
              </div>
              <div className="mt-2 font-mono text-[10px] text-theme-accent font-semibold">
                Free & Paid Sources
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPreference('self_learning')}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                selectedPreference === 'self_learning'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-1 ring-emerald-500'
                  : 'border-theme-border bg-theme-card/50 hover:border-emerald-500/40'
              }`}
            >
              <div className="text-xl mb-1">📖</div>
              <div className="font-display text-sm font-bold text-theme-text">
                Self-Learning Path
              </div>
              <div className="text-[11px] text-theme-secondary mt-1 leading-relaxed">
                Documentation on GeeksforGeeks, MDN, unpaid open-source guides, and paid deep-dives.
              </div>
              <div className="mt-2 font-mono text-[10px] text-emerald-400 font-semibold">
                Articles & Text Guides
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPreference('mentor_based')}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                selectedPreference === 'mentor_based'
                  ? 'border-rose-500 bg-rose-500/10 shadow-md ring-1 ring-rose-500'
                  : 'border-theme-border bg-theme-card/50 hover:border-rose-500/40'
              }`}
            >
              <div className="text-xl mb-1">🎓</div>
              <div className="font-display text-sm font-bold text-theme-text">
                Mentor-Based Path
              </div>
              <div className="text-[11px] text-theme-secondary mt-1 leading-relaxed">
                Curated YouTube video lectures, masterclasses, and mentor walkthrough sessions.
              </div>
              <div className="mt-2 font-mono text-[10px] text-rose-400 font-semibold">
                Video & Masterclasses
              </div>
            </button>
          </div>

          {/* Action Button */}
          <div className="text-center pt-2">
            <Button
              onClick={handleBuildRoadmap}
              disabled={buildingRoadmap}
              variant="cyan"
              className="py-3 px-8 text-base shadow-xl mx-auto"
            >
              {buildingRoadmap ? 'Synthesizing AI Roadmap...' : '🗺 Build 7-Day Study Roadmap ➔'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Report;
