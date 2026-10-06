// src/components/typing/MonkeytypeStatus.jsx
// Live status badge for the Monkeytype service, fed from the instatus API.

import { useMonkeytypeStatus } from '../../services/monkeytypeService';

const STATUS_CONFIG = {
  UP: {
    label: 'Operational',
    dotColor: '#10b981',
    borderClass: 'border-emerald-500/40',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
  },
  HASISSUES: {
    label: 'Degraded',
    dotColor: '#f59e0b',
    borderClass: 'border-amber-500/40',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
  },
  UNDERMAINTENANCE: {
    label: 'Maintenance',
    dotColor: '#3b82f6',
    borderClass: 'border-blue-500/40',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
  },
  DOWN: {
    label: 'Offline',
    dotColor: '#ef4444',
    borderClass: 'border-red-500/40',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
  },
  UNKNOWN: {
    label: 'Unknown',
    dotColor: '#6b7280',
    borderClass: 'border-gray-500/40',
    bgClass: 'bg-gray-500/10',
    textClass: 'text-gray-400',
  },
};

function MonkeytypeStatus() {
  const { statusData, loading, error, refresh } = useMonkeytypeStatus();

  if (loading && !statusData) {
    return (
      <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 animate-pulse">
        <div className="w-2.5 h-2.5 rounded-full bg-theme-muted/40" />
        <span className="font-mono text-xs text-theme-muted">Checking Monkeytype status…</span>
      </div>
    );
  }

  const status = statusData?.status || 'UNKNOWN';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;
  const isUp = status === 'UP';

  return (
    <div
      className={`glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-4 ${config.borderClass} border transition-all duration-300`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Animated pulse dot */}
        <span className="relative flex h-3 w-3 shrink-0">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
            style={{ backgroundColor: config.dotColor }}
          />
          <span
            className="relative inline-flex rounded-full h-3 w-3"
            style={{ backgroundColor: config.dotColor }}
          />
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-theme-text">
              {statusData?.name || 'Monkeytype'}
            </span>
            <span
              className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bgClass} ${config.textClass}`}
            >
              {config.label}
            </span>
          </div>
          {error && (
            <p className="font-mono text-[10px] text-theme-muted mt-0.5 truncate">
              Last check failed — showing cached status
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isUp && statusData?.url && (
          <a
            href="https://monkeytype.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-theme-accent hover:underline hidden sm:inline"
          >
            Practice on Monkeytype ↗
          </a>
        )}
        <button
          onClick={refresh}
          disabled={loading}
          className="p-1.5 rounded-lg border border-theme-border hover:border-theme-accent text-theme-muted hover:text-theme-accent transition-colors disabled:opacity-40"
          aria-label="Refresh status"
          title="Refresh status"
        >
          <svg
            className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default MonkeytypeStatus;
