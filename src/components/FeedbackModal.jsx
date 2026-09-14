import { useState } from "react"
import { Star, Loader2, X } from "lucide-react"
import { submitAppFeedback } from "../services/api"
import { markFeedbackAsked } from "../utils/feedbackPrompt"

const PROMPT_COPY = {
  event_created: "You just created an event on SoundScout. How was that experience?",
  bid_placed: "You just placed a bid on SoundScout. How was that experience?",
  event_finished: "Your event just wrapped up. How was your overall SoundScout experience?",
}

// triggerType: "event_created" | "bid_placed" | "event_finished"
// referenceId: the event_id or bid_id this prompt is about (used only to dedupe in localStorage)
function FeedbackModal({ isOpen, onClose, triggerType, referenceId }) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  function dismiss() {
    markFeedbackAsked(triggerType, referenceId)
    setRating(5)
    setComment("")
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    submitAppFeedback({ triggerType, referenceId, rating, comment })
      .catch((err) => console.warn("Could not submit feedback", err))
      .finally(() => {
        setSubmitting(false)
        dismiss()
      })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-navy/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-md border border-slate/15 bg-white shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate/10 pb-4">
          <h2 className="font-display text-base font-semibold text-ink-navy">Rate SoundScout</h2>
          <button onClick={dismiss} className="text-slate hover:text-ink-navy" aria-label="Dismiss">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="font-body text-sm text-slate">
            {PROMPT_COPY[triggerType] || "How's your experience with SoundScout so far?"}
          </p>

          <div className="flex justify-center gap-1.5 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="transition-transform active:scale-95"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  size={32}
                  className={`transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-signal-amber text-signal-amber"
                      : "text-slate/30"
                  }`}
                  strokeWidth={2}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-widest text-slate">
              Anything we should know? (optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What worked, what didn't, what you'd want to see..."
              className="w-full rounded border border-slate/25 bg-white px-3 py-2 text-sm text-ink-navy transition-colors focus-visible:outline-2 focus-visible:outline-signal-amber"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 rounded border border-slate/25 py-2.5 font-sans text-sm font-semibold text-slate hover:bg-slate/5 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-ink-navy py-2.5 font-sans text-sm font-semibold text-white hover:bg-ink-navy/90 transition-colors flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackModal
