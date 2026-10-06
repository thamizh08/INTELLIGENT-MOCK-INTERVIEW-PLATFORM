// src/components/common/Loader.jsx
// Theme-adaptive loading spinner with accent-colored glowing border and pulse animation.

function Loader({ message = 'Initializing cyber engine...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer glowing border ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: '2px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)',
            borderTopColor: 'var(--accent-primary)',
            borderRightColor: 'var(--accent-secondary)',
            boxShadow: '0 0 15px var(--glow-accent)',
          }}
        />
        {/* Inner pixel core */}
        <div
          className="w-4 h-4 rounded-xs animate-ping"
          style={{
            backgroundColor: 'var(--accent-primary)',
            boxShadow: '0 0 10px var(--accent-primary)',
          }}
        />
      </div>
      <p
        className="font-mono text-xs tracking-widest uppercase animate-pulse"
        style={{ color: 'var(--accent-primary)' }}
      >
        {message}
      </p>
    </div>
  );
}

export default Loader;
