import { useState, useEffect } from "react"
import { MessageSquare, X } from "lucide-react"

function FloatingWhatsAppWidget() {
  const [botPhone, setBotPhone] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchBotPhone() {
      try {
        const workerUrl = "https://sound-scout-whatsapp-worker.onrender.com"
        const resp = await fetch(`${workerUrl}/`, { mode: "cors" })
        if (resp.ok) {
          const data = await resp.json()
          if (data && data.botPhone) {
            const clean = String(data.botPhone).replace(/\D/g, "")
            if (clean.length >= 9 && clean.length <= 13 && !clean.startsWith("63415")) {
              setBotPhone(clean)
            }
          }
        }
      } catch (e) {
        // Fallback gracefully without error notice
      }
    }
    fetchBotPhone()
  }, [])

  const cleanPhone = botPhone || "94703252870"
  const defaultText = "Hi SoundScout AI! I'm using the SoundScout platform and would like to enable instant booking & payment notifications on WhatsApp."
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(defaultText)}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-body">
      {/* Expanded Encourage Popover */}
      {isOpen && (
        <div className="w-72 sm:w-80 rounded-2xl border border-emerald-500/20 bg-paper/95 p-4 shadow-2xl backdrop-blur-md animate-fade-in-up">
          <div className="flex items-start justify-between border-b border-slate/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-display text-sm font-semibold text-ink-navy">
                SoundScout WhatsApp Bot
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate/60 hover:text-ink-navy transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-3 text-xs text-slate leading-relaxed">
            💬 <span className="font-semibold text-ink-navy">Enable Instant Notifications!</span> Message our WhatsApp bot once to receive instant booking receipts, bid alerts, and escrow payment updates directly on WhatsApp without delivery blocks!
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 font-display text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#20bd5a] hover:shadow-xl active:scale-95"
          >
            <MessageSquare size={16} />
            Chat with Bot on WhatsApp
          </a>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] active:scale-95 focus:outline-none"
        title="SoundScout WhatsApp Assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>
        <MessageSquare size={26} strokeWidth={2.2} className="transition-transform duration-300 group-hover:rotate-6" />
      </button>
    </div>
  )
}

export default FloatingWhatsAppWidget
