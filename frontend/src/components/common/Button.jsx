// src/components/common/Button.jsx
// Professional executive button with crisp contrast and fluid micro-animations.

function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
  const base = 'relative px-5 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none flex items-center justify-center gap-2 shadow-sm';

  const variants = {
    primary: 'bg-theme-accent text-white font-bold hover:brightness-110 shadow-md border border-theme-accent/60',
    cyan: 'bg-theme-accent text-white font-bold hover:brightness-110 shadow-md border border-theme-accent/60',
    magenta: 'bg-rose-600 text-white font-bold hover:bg-rose-500 border border-rose-500 shadow-md',
    emerald: 'bg-emerald-600 text-white font-bold hover:bg-emerald-500 border border-emerald-500 shadow-md',
    outline: 'border border-theme-accent text-theme-accent bg-theme-surface hover:bg-theme-accent/10 shadow-sm',
    ghost: 'bg-transparent text-theme-secondary hover:text-theme-text hover:bg-theme-card border border-transparent shadow-none',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;

