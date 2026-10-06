// src/pages/Dashboard.jsx
// Premium analytics dashboard with stats cards, performance trend indicators, and theme-adaptive styling.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReportHistory } from '../services/reportService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

function averageScore(overallScores) {
  if (!overallScores) return '0.0';
  const values = Object.values(overallScores);
  if (values.length === 0) return '0.0';
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
}

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { reports: fetched } = await getReportHistory();
        setReports(fetched);
      } catch (err) {
        setError('Could not load your interview history.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader message="Loading interview logs..." />;

  // Calculate aggregate stats
  const totalSessions = reports.length;
  const avgScore = totalSessions > 0
    ? (reports.reduce((sum, r) => sum + parseFloat(averageScore(r.overallScores)), 0) / totalSessions).toFixed(1)
    : '0.0';
  const bestScore = totalSessions > 0
    ? Math.max(...reports.map(r => parseFloat(averageScore(r.overallScores)))).toFixed(1)
    : '0.0';
  const recentTrend = totalSessions >= 2
    ? (parseFloat(averageScore(reports[0]?.overallScores)) - parseFloat(averageScore(reports[1]?.overallScores))).toFixed(1)
    : null;

  const STATS = [
    { label: 'Total Sessions', value: totalSessions, icon: '📋' },
    { label: 'Average Score', value: `${avgScore}/10`, icon: '📊' },
    { label: 'Best Score', value: `${bestScore}/10`, icon: '🏆' },
    { label: 'Recent Trend', value: recentTrend !== null ? `${recentTrend > 0 ? '+' : ''}${recentTrend}` : 'N/A', icon: recentTrend > 0 ? '📈' : recentTrend < 0 ? '📉' : '➡️' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8 border-b border-theme-border pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-theme-text tracking-wide">Performance Logs</h1>
          <p className="font-mono text-xs text-theme-accent mt-1">AI MOCK SESSION HISTORY</p>
        </div>
        <Link to="/role-selection">
          <Button variant="cyan" className="shadow-lg">+ New Interview</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 text-center animate-slide-up">
            <span className="text-lg">{stat.icon}</span>
            <div className="font-display text-xl font-extrabold text-theme-accent mt-1">{stat.value}</div>
            <div className="font-mono text-[10px] text-theme-muted uppercase tracking-wider mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-sm mb-6 font-mono animate-fade-in">
          ⚠ {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="rounded-xl p-10 text-center border border-theme-border bg-theme-surface">
          <p className="font-mono text-sm text-theme-muted">
            No interview records found. Start your first session to build your performance analytics!
          </p>
          <div className="mt-6">
            <Link to="/role-selection">
              <Button variant="cyan">Start First Session ➔</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, idx) => {
            const score = averageScore(report.overallScores);
            const isHigh = parseFloat(score) >= 7.0;
            const roleName = report.session?.role || '';

            return (
              <Link
                key={report._id}
                to={`/report/${typeof report.session === 'object' ? report.session._id : report.session}`}
                className="block rounded-xl p-5 border border-theme-border bg-theme-surface hover:border-theme-accent transition-all duration-200 shadow-sm hover:shadow-lg animate-slide-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-theme-accent font-semibold">
                        {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-theme-border">•</span>
                      {roleName && (
                        <>
                          <span className="font-mono text-[10px] text-theme-secondary px-1.5 py-0.5 rounded bg-theme-accent/10 border border-theme-accent/30">
                            {roleName}
                          </span>
                          <span className="text-theme-border">•</span>
                        </>
                      )}
                      <span className="font-mono text-[10px] text-theme-muted uppercase">
                        Session #{(typeof report.session === 'object' ? report.session._id : report.session)?.slice(-6) || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 text-theme-secondary">{report.summaryText}</p>
                  </div>

                  <div className={`shrink-0 font-mono text-base px-3.5 py-2 rounded-lg border font-bold ${
                    isHigh
                      ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                      : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                  }`}>
                    {score} <span className="text-xs opacity-70">/ 10</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
