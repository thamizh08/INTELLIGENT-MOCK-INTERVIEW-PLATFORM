// src/pages/Signup.jsx
// Professional account registration portal with real-time password strength analyzer,
// requirement checklist indicators, and show/hide password toggle.

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time password criteria validation
  const validation = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    const passedCount = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

    let score = 'weak';
    let label = 'Too Weak';
    let color = 'bg-rose-500';
    let textClass = 'text-rose-400';
    let width = '25%';

    if (passedCount === 2) {
      score = 'fair';
      label = 'Moderate';
      color = 'bg-amber-500';
      textClass = 'text-amber-400';
      width = '50%';
    } else if (passedCount === 3) {
      score = 'good';
      label = 'Good';
      color = 'bg-blue-500';
      textClass = 'text-blue-400';
      width = '75%';
    } else if (passedCount === 4) {
      score = 'strong';
      label = 'Strong & Secure';
      color = 'bg-emerald-500';
      textClass = 'text-emerald-400';
      width = '100%';
    }

    const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;

    return {
      hasMinLength,
      hasUppercase,
      hasNumber,
      hasSpecial,
      passedCount,
      isValid,
      label,
      color,
      textClass,
      width,
    };
  }, [password]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validation.isValid) {
      setError('Please ensure your password fulfills all 4 security criteria below.');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/role-selection');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 px-6">
      <div className="rounded-2xl p-8 border border-theme-border bg-theme-surface shadow-2xl relative overflow-hidden animate-scale-up">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-emerald))',
          }}
        />

        <div className="mb-6 text-center sm:text-left">
          <span className="font-mono text-[10px] text-theme-accent px-2.5 py-0.5 rounded bg-theme-accent/15 border border-theme-accent/30 uppercase font-bold tracking-wider">
            CANDIDATE PORTAL
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-theme-text mt-2">
            Create Your Account
          </h1>
          <p className="text-xs text-theme-secondary mt-1">
            Start your AI-guided interview simulations and personalized learning roadmap.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-theme-secondary mb-1 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-theme-card border border-theme-border rounded-xl p-3 text-sm text-theme-text placeholder:text-theme-muted focus:border-theme-accent focus:outline-none transition-colors shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-theme-secondary mb-1 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              placeholder="candidate@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-theme-card border border-theme-border rounded-xl p-3 text-sm text-theme-text placeholder:text-theme-muted focus:border-theme-accent focus:outline-none transition-colors shadow-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono text-theme-secondary font-semibold">
                Password
              </label>
              {password && (
                <span className={`text-[11px] font-mono font-bold ${validation.textClass}`}>
                  {validation.label}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 chars (Uppercase, Number, Special)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-theme-card border border-theme-border rounded-xl p-3 pr-11 text-sm text-theme-text placeholder:text-theme-muted focus:border-theme-accent focus:outline-none transition-colors shadow-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-theme-muted hover:text-theme-text text-sm p-0.5 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>

            {/* Password Strength Meter Bar */}
            {password && (
              <div className="w-full h-1.5 bg-theme-card rounded-full mt-2 overflow-hidden border border-theme-border/50">
                <div
                  className={`h-full transition-all duration-300 ${validation.color}`}
                  style={{ width: validation.width }}
                />
              </div>
            )}

            {/* Password Requirement Checklist */}
            <div className="mt-3 p-3 rounded-xl bg-theme-card/50 border border-theme-border/60 space-y-1.5">
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-theme-muted mb-1">
                Password Security Criteria
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-mono">
                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    validation.hasMinLength ? 'text-emerald-400 font-semibold' : 'text-theme-muted'
                  }`}
                >
                  <span>{validation.hasMinLength ? '✓' : '○'}</span>
                  <span>Min. 8 characters</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    validation.hasUppercase ? 'text-emerald-400 font-semibold' : 'text-theme-muted'
                  }`}
                >
                  <span>{validation.hasUppercase ? '✓' : '○'}</span>
                  <span>1+ Capital letter (A-Z)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    validation.hasNumber ? 'text-emerald-400 font-semibold' : 'text-theme-muted'
                  }`}
                >
                  <span>{validation.hasNumber ? '✓' : '○'}</span>
                  <span>1+ Number (0-9)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    validation.hasSpecial ? 'text-emerald-400 font-semibold' : 'text-theme-muted'
                  }`}
                >
                  <span>{validation.hasSpecial ? '✓' : '○'}</span>
                  <span>1+ Special char (!@#$...)</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-rose-400 text-xs font-mono p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 animate-fade-in flex items-start gap-2">
              <span className="text-sm">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (password.length > 0 && !validation.isValid)}
            variant="cyan"
            className="w-full py-3 text-base mt-3 shadow-xl"
          >
            {loading ? 'Creating Account...' : 'Create Account Free ➔'}
          </Button>
        </form>

        <p className="text-xs font-mono text-theme-muted mt-6 text-center">
          Already registered?{' '}
          <Link to="/login" className="text-theme-accent font-bold hover:underline">
            Log in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
