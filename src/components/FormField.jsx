import { useId } from "react"
import { AlertCircle } from "lucide-react"

const baseInputClass =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-450 transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2] disabled:bg-gray-50 disabled:text-gray-400 shadow-sm focus:border-[#0891B2]/50"

// Same visual result as bg-white/text-gray-900, but using bracket-value classes so the
// global `html.dark .bg-white { ... !important }` override (index.css) can't match them.
// Use forceLight on fields inside cards that are intentionally always-light regardless of
// the site theme (e.g. the auth pages' floating card on a fixed dark backdrop) — otherwise
// the input flips dark via that override while its light card container doesn't, and they
// end up visibly mismatched.
const forceLightInputClass =
  "w-full rounded-lg border bg-[#ffffff] px-3 py-2.5 text-sm text-[#0f172a] placeholder:text-gray-450 transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2] disabled:bg-gray-50 disabled:text-gray-400 shadow-sm focus:border-[#0891B2]/50"

function FormField({
  label,
  name,
  error,
  as = "input",
  type = "text",
  className = "",
  forceLight = false,
  children,
  ...props
}) {
  const id = useId()
  const errorId = `${id}-error`

  const inputBaseClass = forceLight ? forceLightInputClass : baseInputClass
  const borderClass = error
    ? "border-red-500"
    : forceLight
      ? "border-[#e5e7eb] hover:border-[#d1d5db]"
      : "border-gray-200 hover:border-gray-300"

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest ${
          forceLight ? "text-[#6b7280]" : "text-gray-500"
        }`}
      >
        {label}
      </label>

      {as === "select" ? (
        <select
          id={id}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBaseClass} ${borderClass}`}
          {...props}
        >
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBaseClass} ${borderClass}`}
          {...props}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBaseClass} ${borderClass}`}
          {...props}
        />
      )}

      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={13} strokeWidth={2.5} />
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
