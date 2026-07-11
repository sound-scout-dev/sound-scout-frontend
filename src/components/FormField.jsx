import { useId } from "react"
import { AlertCircle } from "lucide-react"

const baseInputClass =
  "w-full rounded border bg-white px-3 py-2.5 text-sm text-ink-navy placeholder:text-slate/50 transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber disabled:bg-slate/5 disabled:text-slate/40"

function FormField({
  label,
  name,
  error,
  as = "input",
  type = "text",
  className = "",
  children,
  ...props
}) {
  const id = useId()
  const errorId = `${id}-error`

  const borderClass = error
    ? "border-alert-red"
    : "border-slate/25 hover:border-slate/40"

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-slate"
      >
        {label}
      </label>

      {as === "select" ? (
        <select
          id={id}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${baseInputClass} ${borderClass}`}
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
          className={`${baseInputClass} ${borderClass}`}
          {...props}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${baseInputClass} ${borderClass}`}
          {...props}
        />
      )}

      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-xs text-alert-red">
          <AlertCircle size={13} strokeWidth={2.5} />
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
