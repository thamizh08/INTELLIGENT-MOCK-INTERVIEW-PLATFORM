// src/pages/Home.jsx
// Premium hero landing page with theme-adaptive styling, stats section, and how-it-works.

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const FEATURES = [
  { icon: '🤖', title: 'Adaptive AI Interviewer', desc: 'Dynamic follow-up questions that challenge your exact response and probe for architectural trade-offs.', accent: 'accent-primary' },
  { icon: '🎯', title: 'Keyword-Rigorous Scoring', desc: 'Strict technical keyword deduction — marks reduced when essential domain terminology is missing.', accent: 'accent-secondary' },
  { icon: '⭐', title: 'Benchmark Answers', desc: 'See how a top 1% candidate would answer each question with senior-level precision.', accent: 'accent-emerald' },
];

const STEPS = [
  { num: '01', title: 'Select Your Role', desc: '20+ job roles with role-specific question banks and keyword grading rubrics.' },
  { num: '02', title: 'Face the AI Interviewer', desc: 'Answer questions one at a time with AI voice assistant, timer, and real-time evaluation.' },
  { num: '03', title: 'Get Hiring Verdict', desc: 'Receive per-question scores, missing keyword feedback, offer probability, and a 7-day study plan.' },
];

const STATS = [
  { value: '20+', label: 'Job Roles' },
  { value: '160+', label: 'Interview Questions' },
  { value: '4', label: 'Adaptive Themes' },
  { value: '7-Day', label: 'AI Study Plans' },
];

function Home() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] blur-[120px] pointer-events-none rounded-full" style={{ background: 'var(--orb1-color)' }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] blur-[140px] pointer-events-none rounded-full" style={{ background: 'var(--orb2-color)' }} />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-surface border border-theme-border shadow-sm mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-primary)' }} />
          <span className="font-mono text-xs text-theme-accent tracking-wider uppercase font-semibold">
            AI Mock Interview Platform
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-theme-text animate-slide-up">
          Master the Interview <br />
          <span style={{ color: 'var(--accent-primary)' }}>Before It Counts.</span>
        </h1>

        <p className="mt-6 text-theme-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          An adaptive AI interviewer with <strong>strict keyword-rigorous scoring</strong>, voice assistant, benchmark answers, and personalized study roadmaps for 20+ tech roles.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link to={user ? '/role-selection' : '/signup'}>
            <Button variant="cyan" className="text-base py-3 px-8">
              {user ? '⚡ Launch New Session' : '🚀 Get Started Free'}
            </Button>
          </Link>
          {user && (
            <Link to="/dashboard">
              <Button variant="outline" className="text-base py-3 px-6">
                📊 View Analytics Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {STATS.map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <div className="font-display text-2xl font-extrabold text-theme-accent">{stat.value}</div>
              <div className="font-mono text-[10px] text-theme-muted uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-6 animate-slide-up"
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-xl mb-4"
                style={{ background: `var(--${feature.accent})15`, border: `1px solid var(--${feature.accent})40`, color: `var(--${feature.accent})` }}
              >
                {feature.icon}
              </div>
              <h3 className="font-display text-lg text-theme-text font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-theme-muted leading-normal">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="font-display text-2xl font-bold text-theme-text mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative p-6 rounded-xl border border-theme-border bg-theme-surface text-left">
                <span className="font-display text-3xl font-extrabold text-theme-accent opacity-30 absolute top-4 right-4">{step.num}</span>
                <h3 className="font-display text-base font-bold text-theme-text mb-2">{step.title}</h3>
                <p className="text-sm text-theme-muted leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-theme-accent text-lg">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
