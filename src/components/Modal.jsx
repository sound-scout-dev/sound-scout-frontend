import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

function Modal({ title, onClose, children }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl animate-modal-content focus-visible:outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="font-display text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-400 transition-colors duration-150 ease-out hover:text-[#0891B2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2]"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
