import React from "react"

const VARIANTS = {
  primary:
    "bg-[#059669] text-white hover:bg-[#047857] active:bg-[#065f46] disabled:bg-slate-200 disabled:text-slate-400 font-semibold shadow-sm",
  secondary:
    "bg-[#0891B2] text-white hover:bg-[#0e7490] active:bg-[#155e75] disabled:bg-slate-200 disabled:text-slate-400 font-semibold shadow-sm",
  outline:
    "bg-transparent text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:border-slate-100 disabled:text-slate-300",
  "outline-dark":
    "bg-transparent text-slate-800 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 disabled:border-slate-100 disabled:text-slate-300",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 disabled:text-slate-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-slate-200 disabled:text-slate-400 shadow-sm",
  glass:
    "bg-white/85 border border-slate-200/60 backdrop-blur-md text-slate-800 hover:bg-white hover:border-slate-300 active:bg-white/85 shadow-sm",
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
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2]
        disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}

export default Button
