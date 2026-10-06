// src/pages/RoleSelection.jsx
// Premium session configurator with 20+ role cards, experience/round selectors, custom role input.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../services/interviewService';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const ROLE_CARDS = [
  { name: 'Java Developer', icon: '☕', color: '#f89820' },
  { name: 'Frontend Developer', icon: '⚛️', color: '#61dafb' },
  { name: 'Python Developer', icon: '🐍', color: '#3776ab' },
  { name: 'Full Stack Developer', icon: '🔗', color: '#00d4aa' },
  { name: 'Backend Developer', icon: '⚙️', color: '#68a063' },
  { name: 'Data Analyst', icon: '📊', color: '#e97627' },
  { name: 'Data Scientist', icon: '🧠', color: '#9b59b6' },
  { name: 'DevOps Engineer', icon: '🚀', color: '#2496ed' },
  { name: 'Cloud Architect', icon: '☁️', color: '#ff9900' },
  { name: 'Mobile Developer', icon: '📱', color: '#a4c639' },
  { name: 'Machine Learning Engineer', icon: '🤖', color: '#ff6f61' },
  { name: 'QA Engineer', icon: '🧪', color: '#27ae60' },
  { name: 'Product Manager', icon: '📋', color: '#3498db' },
  { name: 'Cybersecurity Analyst', icon: '🔒', color: '#e74c3c' },
  { name: 'Database Administrator', icon: '🗄️', color: '#f39c12' },
  { name: 'UI/UX Designer', icon: '🎨', color: '#e91e63' },
  { name: 'System Administrator', icon: '🖥️', color: '#8e44ad' },
  { name: 'Blockchain Developer', icon: '⛓️', color: '#f7931a' },
  { name: 'Game Developer', icon: '🎮', color: '#1abc9c' },
];

const LEVELS = [
  { value: 'fresher', label: 'Fresher', desc: '0 years' },
  { value: 'junior', label: 'Junior', desc: '1-3 years' },
  { value: 'mid', label: 'Mid-Level', desc: '3-5 years' },
  { value: 'senior', label: 'Senior', desc: '5+ years' },
];

const ROUNDS = [
  { value: 'technical', label: 'Technical', icon: '💻' },
  { value: 'hr_behavioral', label: 'Behavioral / HR', icon: '👔' },
  { value: 'system_design', label: 'System Design', icon: '🏗️' },
  { value: 'coding', label: 'Coding', icon: '⌨️' },
  { value: 'screening', label: 'Screening', icon: '📞' },
];

function RoleSelection() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('junior');
  const [round, setRound] = useState('technical');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedRole = customRole.trim() || role;

  async function handleStart() {
    if (!selectedRole) {
      setError('Please select or enter a job role.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { sessionId } = await startInterview({ role: selectedRole, experienceLevel, round });
      navigate(`/interview/${sessionId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start interview. Please try again.');
      setLoading(false);
    }
  }

  if (loading) return <Loader message="Initializing AI Interview Engine..." />;

  return (
    <div className="max-w-3xl mx-auto my-8 px-6">
      <div className="rounded-xl p-6 sm:p-8 border border-theme-border bg-theme-surface shadow-xl relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" style={{ background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-emerald))` }} />

        <div className="mb-6">
          <span className="font-mono text-[10px] text-theme-accent px-2.5 py-0.5 rounded bg-theme-accent/15 border border-theme-accent/30 uppercase font-bold">
            SESSION CONFIGURATOR
          </span>
          <h1 className="font-display text-2xl font-bold text-theme-text mt-2">Configure Your Interview</h1>
          <p className="text-xs text-theme-muted font-mono mt-1">Select your target role, experience level, and interview type</p>
        </div>

        {/* Role Cards Grid */}
        <div className="mb-6">
          <label className="block text-xs font-mono font-semibold text-theme-accent mb-3 uppercase">Target Role</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {ROLE_CARDS.map((r) => (
              <button
                key={r.name}
                onClick={() => { setRole(r.name); setCustomRole(''); }}
                className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer text-xs font-mono ${
                  role === r.name && !customRole
                    ? 'border-theme-accent bg-theme-accent/15 text-theme-text shadow-md'
                    : 'border-theme-border bg-theme-card hover:border-theme-accent/50 text-theme-secondary hover:text-theme-text'
                }`}
              >
                <span className="text-lg block mb-1">{r.icon}</span>
                <span className="font-semibold leading-tight block">{r.name}</span>
              </button>
            ))}
          </div>

          {/* Custom Role Input */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="Or type a custom role (e.g., iOS Developer, SRE Engineer)..."
              value={customRole}
              onChange={(e) => { setCustomRole(e.target.value); if (e.target.value) setRole(''); }}
              className="w-full bg-theme-card border border-theme-border rounded-lg p-3 text-sm text-theme-text font-mono placeholder:text-theme-muted focus:border-theme-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Experience Level Cards */}
        <div className="mb-6">
          <label className="block text-xs font-mono font-semibold text-theme-accent mb-3 uppercase">Experience Level</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setExperienceLevel(l.value)}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  experienceLevel === l.value
                    ? 'border-theme-accent bg-theme-accent/15 text-theme-text'
                    : 'border-theme-border bg-theme-card text-theme-secondary hover:border-theme-accent/50'
                }`}
              >
                <span className="font-mono text-sm font-bold block">{l.label}</span>
                <span className="font-mono text-[10px] text-theme-muted">{l.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Round Selection */}
        <div className="mb-6">
          <label className="block text-xs font-mono font-semibold text-theme-accent mb-3 uppercase">Interview Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROUNDS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRound(r.value)}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  round === r.value
                    ? 'border-theme-accent bg-theme-accent/15 text-theme-text'
                    : 'border-theme-border bg-theme-card text-theme-secondary hover:border-theme-accent/50'
                }`}
              >
                <span className="text-base block mb-0.5">{r.icon}</span>
                <span className="font-mono text-xs font-semibold">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Summary */}
        {selectedRole && (
          <div className="mb-4 p-3 rounded-lg border border-theme-accent/30 bg-theme-accent/10 font-mono text-xs text-theme-text animate-fade-in">
            <strong className="text-theme-accent">Session Config:</strong> {selectedRole} • {experienceLevel} • {round.replace('_', ' ')}
          </div>
        )}

        {error && (
          <p className="text-xs font-mono mt-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            ⚠ {error}
          </p>
        )}

        <div className="mt-6">
          <Button onClick={handleStart} variant="cyan" className="w-full py-3 text-base shadow-lg" disabled={!selectedRole}>
            🚀 Launch Interview ➔
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
