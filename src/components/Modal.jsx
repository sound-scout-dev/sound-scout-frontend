import { useEffect } from "react"
import { X } from "lucide-react"

function Modal({ title, onClose, children }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-navy/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-md border border-slate/15 bg-paper p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="font-display text-lg font-semibold text-ink-navy">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-slate transition-colors duration-150 ease-out hover:text-ink-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
