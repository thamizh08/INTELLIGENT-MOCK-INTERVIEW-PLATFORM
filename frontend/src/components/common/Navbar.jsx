// src/components/common/Navbar.jsx
// Premium responsive navigation with user avatar, mobile hamburger menu, and theme switcher.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';
import ThemeSwitcher from './ThemeSwitcher';

const NAV_LINKS = [
  { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { to: '/roadmap', icon: '🗺', label: 'Roadmap' },
  { to: '/role-selection', icon: '🎯', label: 'New Interview' },
];

function UserAvatar({ name }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shrink-0"
      style={{
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        borderColor: 'var(--accent-primary)',
      }}
    >
      {initials}
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-theme-border bg-theme-surface/90 backdrop-blur-md shadow-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2 text-lg sm:text-xl font-bold text-theme-text tracking-tight">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'var(--accent-primary)' }} />
          Mock<span className="text-theme-accent">Interview</span>
          <span className="font-mono text-[9px] text-theme-accent px-1.5 py-0.5 border border-theme-accent/30 rounded bg-theme-accent/10 tracking-normal ml-0.5 hidden sm:inline">
            AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 font-mono text-xs tracking-wide">
          {user ? (
            <>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-theme-secondary hover:text-theme-accent transition-colors flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-theme-card"
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              ))}

              <span className="text-theme-muted">|</span>

              {/* User Avatar & Name */}
              <div className="flex items-center gap-2 bg-theme-card px-3 py-1.5 rounded-lg border border-theme-border">
                <UserAvatar name={user.name} />
                <span className="text-theme-secondary text-[11px]">
                  <strong className="text-theme-accent font-semibold">{user.name.split(' ')[0]}</strong>
                </span>
              </div>

              <Button variant="ghost" onClick={handleLogout} className="text-xs py-1.5 px-3 text-theme-muted hover:text-theme-text">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-theme-secondary hover:text-theme-accent transition-colors py-1.5 px-3">Log in</Link>
              <Button onClick={() => navigate('/signup')} variant="cyan" className="py-1.5 px-4 text-xs">Sign up</Button>
            </>
          )}

          <span className="text-theme-muted">|</span>
          <ThemeSwitcher />
        </div>

        {/* Mobile: Theme + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-theme-border bg-theme-card text-theme-text hover:border-theme-accent transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-theme-border bg-theme-surface px-4 pb-4 pt-2 space-y-1 animate-slide-up">
          {user ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-theme-card border border-theme-border mb-2">
                <UserAvatar name={user.name} />
                <div>
                  <div className="font-mono text-sm font-bold text-theme-text">{user.name}</div>
                  <div className="font-mono text-[10px] text-theme-muted">{user.email}</div>
                </div>
              </div>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 font-mono text-sm text-theme-secondary hover:text-theme-accent py-2.5 px-3 rounded-lg hover:bg-theme-card transition-colors"
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              ))}

              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="w-full text-left flex items-center gap-2 font-mono text-sm text-theme-muted hover:text-rose-400 py-2.5 px-3 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                🚪 Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block font-mono text-sm text-theme-secondary hover:text-theme-accent py-2.5 px-3 rounded-lg hover:bg-theme-card transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="block font-mono text-sm text-theme-accent font-bold py-2.5 px-3 rounded-lg bg-theme-accent/10 border border-theme-accent/30 text-center"
              >
                Sign up Free ➔
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
