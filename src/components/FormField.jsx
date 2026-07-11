export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  mono = false,
  children, // for select dropdowns
  ...rest
}) {
  const inputClasses = `
    w-full px-3 py-2.5 rounded bg-white border text-sm transition-colors
    ${mono ? 'font-mono' : 'font-body'}
    ${error
      ? 'border-error focus:border-error focus:ring-1 focus:ring-error/30'
      : 'border-ink-navy/15 focus:border-signal-amber focus:ring-1 focus:ring-signal-amber/30'
    }
    ${disabled ? 'bg-paper-dark cursor-not-allowed opacity-60' : ''}
    placeholder:text-slate-light
    outline-none
  `;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink-navy">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}

      {children ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
          {...rest}
        >
          {children}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={4}
          className={`${inputClasses} resize-y min-h-[100px]`}
          {...rest}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...rest}
        />
      )}

      {error && (
        <p className="text-error text-xs flex items-center gap-1" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
