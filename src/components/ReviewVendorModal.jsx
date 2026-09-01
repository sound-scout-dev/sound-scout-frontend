import { useState } from "react"
import { Star, Loader2, X } from "lucide-react"

function ReviewVendorModal({ isOpen, onClose, bid, onSubmitReview }) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !bid) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    onSubmitReview(rating, comment).then(() => {
      setSubmitting(false)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-navy/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-md border border-slate/15 bg-white shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate/10 pb-4">
          <h2 className="font-display text-base font-semibold text-ink-navy">
            Rate & Review Vendor
          </h2>
          <button onClick={onClose} className="text-slate hover:text-ink-navy">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="font-body text-sm text-slate">
            How was your experience working with **{bid.vendorName}**? Your feedback helps keep the marketplace trusted.
          </p>

          {/* Star Selection */}
          <div className="flex justify-center gap-1.5 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="transition-transform active:scale-95"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
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

          {/* Comment */}
          <div>
            <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-widest text-slate">
              Comments / Feedback
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide a brief summary of their equipment quality, timing, and service..."
              className="w-full rounded border border-slate/25 bg-white px-3 py-2 text-sm text-ink-navy transition-colors focus-visible:outline-2 focus-visible:outline-signal-amber"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-ink-navy py-2.5 font-sans text-sm font-semibold text-white hover:bg-ink-navy/90 transition-colors flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting Review...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </form>

      </div>
    </div>
  )
}

export default ReviewVendorModal
