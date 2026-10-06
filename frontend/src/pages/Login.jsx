// src/pages/Login.jsx
// Theme-adaptive authentication portal with premium styling.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-16 px-6">
      <div className="rounded-xl p-8 border border-theme-border bg-theme-surface shadow-xl relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" style={{ background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-emerald))' }} />

        <div className="mb-6">
          <span className="font-mono text-[10px] text-theme-accent px-2.5 py-0.5 rounded bg-theme-accent/15 border border-theme-accent/30 uppercase font-bold">
            USER ACCESS PORTAL
          </span>
          <h1 className="font-display text-2xl font-bold text-theme-text mt-2">Log In to Session</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-theme-secondary mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-theme-card border border-theme-border rounded-lg p-3 text-sm text-theme-text font-mono placeholder:text-theme-muted focus:border-theme-accent focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-theme-secondary mb-1 font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-theme-card border border-theme-border rounded-xl p-3 pr-11 text-sm text-theme-text placeholder:text-theme-muted focus:border-theme-accent focus:outline-none transition-colors font-mono"
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
          </div>

          {error && (
            <p className="text-rose-400 text-xs font-mono p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 animate-fade-in">
              ⚠ {error}
            </p>
          )}

          <Button type="submit" disabled={loading} variant="cyan" className="w-full py-3 text-base mt-2 shadow-lg">
            {loading ? 'Authenticating...' : 'Log In ➔'}
          </Button>
        </form>

        <p className="text-xs font-mono text-theme-muted mt-6 text-center">
          Need an account? <Link to="/signup" className="text-theme-accent font-bold hover:underline">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
