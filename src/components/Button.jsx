const variants = {
  primary: 'bg-signal-amber hover:bg-signal-amber-dark text-ink-navy font-semibold',
  secondary: 'bg-circuit-teal hover:bg-circuit-teal-dark text-white font-semibold',
  outline: 'border border-ink-navy/20 hover:bg-ink-navy/5 text-ink-navy font-medium',
  'outline-light': 'border border-white/20 hover:bg-white/10 text-white font-medium',
  ghost: 'hover:bg-ink-navy/5 text-ink-navy font-medium',
  danger: 'bg-error hover:bg-red-700 text-white font-semibold',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  id,
  type = 'button',
  onClick,
  ...rest
}) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
