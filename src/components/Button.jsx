const VARIANTS = {
  primary:
    "bg-signal-amber text-ink-navy hover:bg-amber-500 active:bg-amber-600 disabled:bg-slate/30",
  secondary:
    "bg-circuit-teal text-paper hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate/30",
  outline:
    "bg-transparent text-paper border border-paper/30 hover:border-paper/70 hover:bg-paper/5 active:bg-paper/10 disabled:border-paper/10 disabled:text-paper/30",
  ghost:
    "bg-transparent text-ink-navy hover:bg-ink-navy/5 active:bg-ink-navy/10 disabled:text-slate/40",
  danger:
    "bg-alert-red text-paper hover:bg-red-600 active:bg-red-700 disabled:bg-slate/30",
}

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
}

function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <Component
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded font-medium
        transition-colors duration-150 ease-out
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber
        disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}

export default Button
