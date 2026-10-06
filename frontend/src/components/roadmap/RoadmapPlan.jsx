// src/components/roadmap/RoadmapPlan.jsx
// Premium theme-adaptive timeline plan renderer featuring:
// - Self-Learning Track (GeeksforGeeks, Docs, Free & Paid Courses)
// - Mentor-Based Track (YouTube video lectures, online platform masterclasses)
// - Subscription Status Indicators (Free / Paid / Freemium)
// - Real-time filtering, search, progress tracking, and YouTube modal preview.

import React, { useState, useMemo } from 'react';
import VideoPreviewModal from './VideoPreviewModal';
import Button from '../common/Button';

// Platform branding helpers
function getPlatformStyle(platform = '') {
  const p = platform.toLowerCase();
  if (p.includes('geeksforgeeks') || p.includes('gfg')) {
    return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981', icon: '🟢', label: 'GeeksforGeeks' };
  }
  if (p.includes('youtube')) {
    return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', icon: '▶', label: 'YouTube' };
  }
  if (p.includes('udemy')) {
    return { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.4)', text: '#c084fc', icon: '🎓', label: 'Udemy' };
  }
  if (p.includes('coursera')) {
    return { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.4)', text: '#38bdf8', icon: '🏛', label: 'Coursera' };
  }
  if (p.includes('freecodecamp')) {
    return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', icon: '🔥', label: 'freeCodeCamp' };
  }
  if (p.includes('github') || p.includes('open source')) {
    return { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.4)', text: '#818cf8', icon: '🐙', label: 'Open Source' };
  }
  if (p.includes('docs') || p.includes('documentation') || p.includes('mdn')) {
    return { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.4)', text: '#38bdf8', icon: '📖', label: 'Documentation' };
  }
  return { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)', text: 'var(--accent-primary)', icon: '📌', label: platform || 'Resource' };
}

function RoadmapPlan({
  plan = [],
  completedTasks = [],
  completedResources = [],
  onToggleTask,
  onToggleResource,
  initialPreference = 'all',
  onPreferenceChange,
}) {
  const [learningMode, setLearningMode] = useState(initialPreference || 'all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all'); // 'all' | 'free' | 'paid'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDays, setExpandedDays] = useState(() => {
    // Default all days expanded
    const map = {};
    plan.forEach((d) => { map[d.day] = true; });
    return map;
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [daySpecificModes, setDaySpecificModes] = useState({});

  function handleModeChange(mode) {
    setLearningMode(mode);
    if (onPreferenceChange) onPreferenceChange(mode);
  }

  function toggleDayExpand(dayNum) {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  }

  function toggleAllDays(expand) {
    const map = {};
    plan.forEach((d) => { map[d.day] = expand; });
    setExpandedDays(map);
  }

  function setDayMode(dayNum, mode) {
    setDaySpecificModes((prev) => ({ ...prev, [dayNum]: mode }));
  }

  // Calculate resource counts
  const stats = useMemo(() => {
    let total = 0;
    let selfCount = 0;
    let mentorCount = 0;
    let freeCount = 0;
    let paidCount = 0;

    plan.forEach((d) => {
      (d.resources || []).forEach((r) => {
        total++;
        if (r.category === 'mentor_based') mentorCount++;
        else selfCount++;

        if (r.subscriptionStatus === 'Paid') paidCount++;
        else freeCount++;
      });
    });

    return { total, selfCount, mentorCount, freeCount, paidCount };
  }, [plan]);

  return (
    <div className="space-y-8">
      {/* ============================================================
          INTERACTIVE LEARNING MODE CONTROLLER & FILTER TOOLBAR
          ============================================================ */}
      <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-theme-text flex items-center gap-2">
              <span>🎯</span> Choose Your Learning Path
            </h2>
            <p className="text-xs text-theme-secondary mt-0.5">
              Tailor your study syllabus between self-paced reading/courses or mentor-led video lectures.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => toggleAllDays(true)}
              className="font-mono text-xs text-theme-accent hover:underline px-2 py-1 rounded hover:bg-theme-card"
            >
              Expand All
            </button>
            <span className="text-theme-border">•</span>
            <button
              onClick={() => toggleAllDays(false)}
              className="font-mono text-xs text-theme-muted hover:underline px-2 py-1 rounded hover:bg-theme-card"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Primary Learning Mode Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-xl bg-theme-card/70 border border-theme-border">
          <button
            onClick={() => handleModeChange('all')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all duration-200 ${
              learningMode === 'all'
                ? 'bg-theme-accent text-theme-main shadow-md scale-[1.01]'
                : 'text-theme-secondary hover:text-theme-text hover:bg-theme-surface/50'
            }`}
          >
            <span>🌟 All Resources</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-normal">
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => handleModeChange('self_learning')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all duration-200 ${
              learningMode === 'self_learning'
                ? 'bg-emerald-500 text-slate-950 shadow-md scale-[1.01]'
                : 'text-theme-secondary hover:text-emerald-400 hover:bg-theme-surface/50'
            }`}
          >
            <span>📖 Self-Learning</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-normal">
              {stats.selfCount}
            </span>
          </button>

          <button
            onClick={() => handleModeChange('mentor_based')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all duration-200 ${
              learningMode === 'mentor_based'
                ? 'bg-rose-500 text-white shadow-md scale-[1.01]'
                : 'text-theme-secondary hover:text-rose-400 hover:bg-theme-surface/50'
            }`}
          >
            <span>🎓 Mentor-Based</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-normal">
              {stats.mentorCount}
            </span>
          </button>
        </div>

        {/* Secondary Filter Row: Subscription Status & Keyword Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-theme-border/60">
          {/* Subscription Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="font-mono text-[11px] text-theme-muted uppercase tracking-wider mr-1">
              Pricing:
            </span>
            <button
              onClick={() => setSubscriptionFilter('all')}
              className={`font-mono text-xs px-2.5 py-1 rounded-md border transition-all ${
                subscriptionFilter === 'all'
                  ? 'border-theme-accent text-theme-accent bg-theme-accent/10 font-bold'
                  : 'border-theme-border text-theme-secondary hover:border-theme-border-accent'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSubscriptionFilter('free')}
              className={`font-mono text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-all ${
                subscriptionFilter === 'free'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
                  : 'border-theme-border text-theme-secondary hover:border-emerald-500/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Free / Unpaid ({stats.freeCount})
            </button>
            <button
              onClick={() => setSubscriptionFilter('paid')}
              className={`font-mono text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-all ${
                subscriptionFilter === 'paid'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-bold'
                  : 'border-theme-border text-theme-secondary hover:border-amber-500/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Paid ({stats.paidCount})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic or platform..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border border-theme-border bg-theme-card/60 text-theme-text placeholder-theme-muted focus:outline-none focus:border-theme-accent"
            />
            <span className="absolute left-2.5 top-2 text-xs text-theme-muted">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-theme-muted hover:text-theme-text"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          7-DAY MASTER TIMELINE WITH EXPANDABLE DAY CARDS
          ============================================================ */}
      <ol
        className="relative ml-4 space-y-8 my-6"
        style={{ borderLeft: '2px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)' }}
      >
        {plan.map((day) => {
          const isExpanded = expandedDays[day.day] !== false;
          const activeDayMode = daySpecificModes[day.day] || learningMode;

          // Filter resources for this day
          const dayResources = (day.resources || []).filter((res) => {
            // Category filter
            if (activeDayMode === 'self_learning' && res.category !== 'self_learning') return false;
            if (activeDayMode === 'mentor_based' && res.category !== 'mentor_based') return false;

            // Subscription status filter
            if (subscriptionFilter === 'free' && res.subscriptionStatus === 'Paid') return false;
            if (subscriptionFilter === 'paid' && res.subscriptionStatus !== 'Paid') return false;

            // Search query filter
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              const matchTitle = (res.title || '').toLowerCase().includes(q);
              const matchPlatform = (res.platform || '').toLowerCase().includes(q);
              const matchDesc = (res.description || '').toLowerCase().includes(q);
              const matchAuthor = (res.channelOrAuthor || '').toLowerCase().includes(q);
              const matchTopic = (day.topic || '').toLowerCase().includes(q);
              if (!matchTitle && !matchPlatform && !matchDesc && !matchAuthor && !matchTopic) {
                return false;
              }
            }

            return true;
          });

          // Compute day completion progress
          const dayTasks = day.tasks || [];
          const dayCompletedTasksCount = dayTasks.filter((t, i) =>
            completedTasks.includes(`d${day.day}-t${i}`)
          ).length;
          const dayCompletedResCount = (day.resources || []).filter((r, i) =>
            completedResources.includes(`d${day.day}-r${i}-${r.title}`)
          ).length;

          const totalItems = dayTasks.length + (day.resources?.length || 0);
          const completedItems = dayCompletedTasksCount + dayCompletedResCount;
          const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

          return (
            <li key={day.day} className="relative ml-8">
              {/* Glowing Node Badge */}
              <button
                onClick={() => toggleDayExpand(day.day)}
                title={`Toggle Day ${day.day}`}
                className="absolute -left-[45px] top-1 flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs font-bold transition-transform hover:scale-110"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid ${progressPct === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)'}`,
                  color: progressPct === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                  boxShadow: `0 0 10px ${progressPct === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)'}`,
                }}
              >
                {progressPct === 100 ? '✓' : day.day}
              </button>

              {/* Day Card Container */}
              <div className="rounded-xl border border-theme-border bg-theme-surface shadow-md overflow-hidden transition-all duration-200 hover:border-theme-accent/50">
                {/* Day Header */}
                <div
                  onClick={() => toggleDayExpand(day.day)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-card/40 hover:bg-theme-card/70 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                        style={{
                          backgroundColor: 'var(--glow-accent)',
                          color: 'var(--accent-primary)',
                          border: '1px solid color-mix(in srgb, var(--accent-primary) 40%, transparent)',
                        }}
                      >
                        DAY {day.day}
                      </span>
                      <span className="font-mono text-[11px] text-theme-muted">
                        • {dayTasks.length} Action Tasks
                      </span>
                      <span className="font-mono text-[11px] text-theme-muted">
                        • {day.resources?.length || 0} Curated Resources
                      </span>
                    </div>
                    <h3 className="font-display text-lg text-theme-text font-bold tracking-wide">
                      {day.topic}
                    </h3>
                  </div>

                  {/* Day Progress & Collapse Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-theme-text">
                        {progressPct}% Done
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-theme-card mt-1 overflow-hidden border border-theme-border/60">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${progressPct}%`,
                            backgroundColor: progressPct === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                          }}
                        />
                      </div>
                    </div>

                    <span className="text-theme-muted text-sm font-mono w-6 h-6 rounded flex items-center justify-center bg-theme-card">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Collapsible Day Body */}
                {isExpanded && (
                  <div className="p-5 space-y-6 border-t border-theme-border/60 animate-fade-in">
                    {/* Actionable Practice Tasks */}
                    <div>
                      <h4 className="font-mono text-xs text-theme-accent uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                        <span>⚡</span> Daily Action Items
                      </h4>
                      <ul className="space-y-2.5">
                        {dayTasks.map((task, i) => {
                          const taskKey = `d${day.day}-t${i}`;
                          const isDone = completedTasks.includes(taskKey);

                          return (
                            <li
                              key={i}
                              onClick={() => onToggleTask && onToggleTask(taskKey)}
                              className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                isDone
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-theme-muted line-through'
                                  : 'bg-theme-card/30 border-theme-border hover:border-theme-accent/50 text-theme-secondary hover:text-theme-text'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => {}} // handled by parent onClick
                                className="mt-0.5 w-4 h-4 rounded border-theme-border text-emerald-500 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-xs sm:text-sm font-sans flex-1">
                                {task}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Resources Section with Choice of Self-Learning vs Mentor-Based */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-theme-border/40">
                        <h4 className="font-mono text-xs text-theme-accent uppercase font-bold tracking-wider flex items-center gap-2">
                          <span>📚</span> Study Resources ({dayResources.length})
                        </h4>

                        {/* Day-Specific Quick Toggle Switch */}
                        <div className="flex items-center gap-1 bg-theme-card p-1 rounded-lg border border-theme-border text-[11px] font-mono">
                          <button
                            onClick={() => setDayMode(day.day, 'all')}
                            className={`px-2 py-0.5 rounded transition-colors ${
                              activeDayMode === 'all'
                                ? 'bg-theme-accent text-theme-main font-bold'
                                : 'text-theme-muted hover:text-theme-text'
                            }`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => setDayMode(day.day, 'self_learning')}
                            className={`px-2 py-0.5 rounded transition-colors ${
                              activeDayMode === 'self_learning'
                                ? 'bg-emerald-500 text-slate-950 font-bold'
                                : 'text-theme-muted hover:text-emerald-400'
                            }`}
                          >
                            📖 Self-Learning
                          </button>
                          <button
                            onClick={() => setDayMode(day.day, 'mentor_based')}
                            className={`px-2 py-0.5 rounded transition-colors ${
                              activeDayMode === 'mentor_based'
                                ? 'bg-rose-500 text-white font-bold'
                                : 'text-theme-muted hover:text-rose-400'
                            }`}
                          >
                            🎓 Mentor Video
                          </button>
                        </div>
                      </div>

                      {dayResources.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-theme-border bg-theme-card/20 text-center">
                          <p className="font-mono text-xs text-theme-muted">
                            No resources match current filter criteria for this day.
                          </p>
                          <button
                            onClick={() => {
                              handleModeChange('all');
                              setSubscriptionFilter('all');
                              setSearchQuery('');
                            }}
                            className="font-mono text-xs text-theme-accent hover:underline mt-1"
                          >
                            Reset filters to view all
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {dayResources.map((res, i) => {
                            const resKey = `d${day.day}-r${i}-${res.title}`;
                            const isExplored = completedResources.includes(resKey);
                            const platformStyle = getPlatformStyle(res.platform);
                            const isMentorVideo = res.category === 'mentor_based';

                            return (
                              <div
                                key={i}
                                className={`rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                                  isExplored
                                    ? 'bg-theme-card/30 border-theme-border opacity-75'
                                    : 'bg-theme-card/60 border-theme-border hover:border-theme-accent/60 shadow-sm hover:shadow-md'
                                }`}
                              >
                                <div className="space-y-2">
                                  {/* Badges Header */}
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    {/* Platform Tag */}
                                    <span
                                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"
                                      style={{
                                        backgroundColor: platformStyle.bg,
                                        border: `1px solid ${platformStyle.border}`,
                                        color: platformStyle.text,
                                      }}
                                    >
                                      <span>{platformStyle.icon}</span>
                                      <span>{platformStyle.label}</span>
                                    </span>

                                    {/* Subscription Status Pill */}
                                    <span
                                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                                        res.subscriptionStatus === 'Paid'
                                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                                          : res.subscriptionStatus === 'Freemium' || res.subscriptionStatus === 'Free Audit Available'
                                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40'
                                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                                      }`}
                                    >
                                      {res.subscriptionStatus === 'Paid'
                                        ? '💎 Paid'
                                        : res.subscriptionStatus === 'Freemium'
                                        ? '🔵 Freemium'
                                        : '🟢 Free / Unpaid'}
                                    </span>
                                  </div>

                                  {/* Resource Title */}
                                  <h5 className="font-display text-sm font-bold text-theme-text line-clamp-2 leading-snug">
                                    {res.title}
                                  </h5>

                                  {/* Description */}
                                  {res.description && (
                                    <p className="text-xs text-theme-secondary line-clamp-2">
                                      {res.description}
                                    </p>
                                  )}
                                </div>

                                {/* Meta details & Launch Actions */}
                                <div className="mt-3 pt-2.5 border-t border-theme-border/50 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-[11px] font-mono text-theme-muted">
                                    {res.duration && <span>⏱ {res.duration}</span>}
                                    {res.channelOrAuthor && (
                                      <>
                                        <span>•</span>
                                        <span className="line-clamp-1 max-w-[110px]">
                                          {res.channelOrAuthor}
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Explored Toggle Checkbox */}
                                    <button
                                      onClick={() => onToggleResource && onToggleResource(resKey)}
                                      title={isExplored ? 'Mark as unexplored' : 'Mark as explored/read'}
                                      className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono transition-colors ${
                                        isExplored
                                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                                          : 'border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-surface'
                                      }`}
                                    >
                                      {isExplored ? '✓' : '○'}
                                    </button>

                                    {/* Action Launch Buttons */}
                                    {isMentorVideo && (
                                      <button
                                        onClick={() => setSelectedVideo(res)}
                                        className="font-mono text-xs px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25 transition-colors flex items-center gap-1 font-semibold"
                                      >
                                        <span>▶ Preview</span>
                                      </button>
                                    )}

                                    <a
                                      href={res.url || 'https://www.google.com'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono text-xs px-2.5 py-1 rounded-lg bg-theme-surface border border-theme-border text-theme-accent hover:border-theme-accent transition-colors flex items-center gap-1 font-semibold"
                                    >
                                      <span>Open</span>
                                      <span className="text-[10px]">↗</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        resource={selectedVideo}
      />
    </div>
  );
}

export default RoadmapPlan;
