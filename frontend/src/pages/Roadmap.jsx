// src/pages/Roadmap.jsx
// Premium theme-adaptive 7-day study roadmap page with milestone timeline,
// self-learning vs mentor-based learning path choice, subscription status indicators,
// and progress telemetry.

import { useState, useEffect, useMemo } from 'react';
import { getActiveRoadmap, completeRoadmap, updateRoadmapProgress } from '../services/roadmapService';
import RoadmapPlan from '../components/roadmap/RoadmapPlan';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completedResources, setCompletedResources] = useState([]);
  const [learningPref, setLearningPref] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const { roadmap: fetched } = await getActiveRoadmap();
        setRoadmap(fetched);
        setCompletedTasks(fetched.completedTasks || []);
        setCompletedResources(fetched.completedResources || []);
        setLearningPref(fetched.learningPreference || 'all');
      } catch (err) {
        setError('No active roadmap yet — complete an interview and build one from your performance report.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute total items and progress percentage
  const progressMetrics = useMemo(() => {
    if (!roadmap?.plan) return { totalTasks: 0, totalResources: 0, completedTasksCount: 0, completedResCount: 0, pct: 0 };
    let totalTasks = 0;
    let totalResources = 0;

    roadmap.plan.forEach((day) => {
      totalTasks += (day.tasks || []).length;
      totalResources += (day.resources || []).length;
    });

    const completedTasksCount = completedTasks.length;
    const completedResCount = completedResources.length;
    const totalItems = totalTasks + totalResources;
    const totalCompleted = completedTasksCount + completedResCount;
    const pct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    return { totalTasks, totalResources, completedTasksCount, completedResCount, pct };
  }, [roadmap, completedTasks, completedResources]);

  async function handleToggleTask(taskKey) {
    const updated = completedTasks.includes(taskKey)
      ? completedTasks.filter((k) => k !== taskKey)
      : [...completedTasks, taskKey];
    setCompletedTasks(updated);

    if (roadmap?._id) {
      updateRoadmapProgress(roadmap._id, { completedTasks: updated }).catch(() => {});
    }
  }

  async function handleToggleResource(resKey) {
    const updated = completedResources.includes(resKey)
      ? completedResources.filter((k) => k !== resKey)
      : [...completedResources, resKey];
    setCompletedResources(updated);

    if (roadmap?._id) {
      updateRoadmapProgress(roadmap._id, { completedResources: updated }).catch(() => {});
    }
  }

  async function handlePreferenceChange(newPref) {
    setLearningPref(newPref);
    if (roadmap?._id) {
      updateRoadmapProgress(roadmap._id, { learningPreference: newPref }).catch(() => {});
    }
  }

  async function handleComplete() {
    setMarking(true);
    try {
      const { roadmap: updated } = await completeRoadmap(roadmap._id);
      setRoadmap(updated);
    } catch (err) {
      setError('Could not update the roadmap right now.');
    } finally {
      setMarking(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) return <Loader message="Loading your custom AI study plan..." />;
  if (error) return (
    <div className="max-w-md mx-auto mt-20 text-center p-8 rounded-xl border border-theme-border bg-theme-surface shadow-xl">
      <div className="w-12 h-12 mx-auto rounded-full bg-theme-accent/10 border border-theme-accent/30 flex items-center justify-center text-theme-accent text-xl mb-4">
        🗺
      </div>
      <p className="font-mono text-sm text-theme-secondary mb-6">{error}</p>
      <a href="/role-selection">
        <Button variant="cyan" className="shadow-lg">Start New Interview Session ➔</Button>
      </a>
    </div>
  );

  const roleName = roadmap.sourceReport?.session?.role || 'Software Engineering';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-[10px] text-theme-accent px-2.5 py-0.5 rounded bg-theme-accent/15 border border-theme-accent/30 uppercase font-bold tracking-wider">
              TARGET MASTERY PATH
            </span>
            <span className="text-theme-border">•</span>
            <span className="font-mono text-xs text-theme-secondary font-semibold">
              {roleName}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-theme-text tracking-tight">
            7-Day Preparation Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Personalized syllabus tackling weak areas identified during your interview simulation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" onClick={handlePrint} className="text-xs py-2 px-3 border border-theme-border">
            🖨 Export / Print
          </Button>

          {roadmap.status === 'active' && (
            <Button
              variant="outline"
              onClick={handleComplete}
              disabled={marking}
              className="text-xs py-2 px-3"
            >
              {marking ? 'Updating...' : '✓ Mark Completed'}
            </Button>
          )}
        </div>
      </div>

      {/* Completion Banner if Marked Done */}
      {roadmap.status === 'completed' && (
        <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-sm font-mono flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-bold text-base text-emerald-300">
                Roadmap Completed!
              </div>
              <div className="text-xs text-emerald-400/80">
                You have addressed your target weak spots. Ready to test your skills in a new mock interview?
              </div>
            </div>
          </div>
          <a href="/role-selection">
            <Button variant="emerald" className="text-xs py-2 px-4 whitespace-nowrap shadow-md">
              Take Follow-Up Mock Test ➔
            </Button>
          </a>
        </div>
      )}

      {/* Overall Progress Telemetry Bar */}
      <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-mono text-xs text-theme-accent uppercase font-bold tracking-wider">
              ROADMAP COMPLETION PROGRESS
            </div>
            <div className="text-xs text-theme-secondary mt-0.5">
              Track tasks checked and study resources explored across the 7 days.
            </div>
          </div>
          <div className="font-mono text-xl font-extrabold text-theme-text sm:text-right">
            {progressMetrics.pct}% <span className="text-xs font-normal text-theme-muted">COMPLETE</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-theme-card overflow-hidden border border-theme-border/70 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressMetrics.pct}%`,
              backgroundColor: progressMetrics.pct === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)',
              boxShadow: `0 0 12px ${progressMetrics.pct === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)'}`,
            }}
          />
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-2.5 rounded-lg bg-theme-card/50 border border-theme-border/60 text-center">
            <div className="font-mono text-xs text-theme-muted">TASKS DONE</div>
            <div className="font-display text-base font-bold text-theme-text mt-0.5">
              {progressMetrics.completedTasksCount} / {progressMetrics.totalTasks}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-theme-card/50 border border-theme-border/60 text-center">
            <div className="font-mono text-xs text-theme-muted">RESOURCES EXPLORED</div>
            <div className="font-display text-base font-bold text-theme-text mt-0.5">
              {progressMetrics.completedResCount} / {progressMetrics.totalResources}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-theme-card/50 border border-theme-border/60 text-center">
            <div className="font-mono text-xs text-theme-muted">SELF-LEARNING SOURCED</div>
            <div className="font-display text-base font-bold text-emerald-400 mt-0.5">
              GeeksforGeeks & Courses
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-theme-card/50 border border-theme-border/60 text-center">
            <div className="font-mono text-xs text-theme-muted">MENTOR SOURCED</div>
            <div className="font-display text-base font-bold text-rose-400 mt-0.5">
              YouTube & Masterclasses
            </div>
          </div>
        </div>
      </div>

      {/* Main Roadmap Plan Timeline */}
      <RoadmapPlan
        plan={roadmap.plan || []}
        completedTasks={completedTasks}
        completedResources={completedResources}
        onToggleTask={handleToggleTask}
        onToggleResource={handleToggleResource}
        initialPreference={learningPref}
        onPreferenceChange={handlePreferenceChange}
      />
    </div>
  );
}

export default Roadmap;
