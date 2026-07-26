import { useId } from "react"
import { AlertCircle } from "lucide-react"

const baseInputClass =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-450 transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2] disabled:bg-gray-50 disabled:text-gray-400 shadow-sm focus:border-[#0891B2]/50"

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
    ? "border-red-500"
    : "border-gray-200 hover:border-gray-300"

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500"
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
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={13} strokeWidth={2.5} />
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
