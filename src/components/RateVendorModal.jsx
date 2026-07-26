import { useState } from "react"
import { Loader2 } from "lucide-react"
import Modal from "./Modal"
import Button from "./Button"
import StarRatingInput from "./StarRatingInput"
import { submitVendorRating } from "../services/api"

function RateVendorModal({ pendingRating, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) {
      setError("Pick a star rating before submitting.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await submitVendorRating({
        eventId: pendingRating.eventId,
        vendorId: pendingRating.vendorId,
        rating,
        review: review.trim() || undefined,
      })
      onSubmitted(pendingRating)
    } catch (err) {
      setError(err.message || "Couldn't submit your rating. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Rate ${pendingRating.vendorName}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <p className="font-body text-sm text-slate">
          For their work on <span className="font-medium text-ink-navy">{pendingRating.eventType}</span>
          {pendingRating.eventDate ? ` on ${new Date(pendingRating.eventDate).toLocaleDateString()}` : ""}.
        </p>

        <div className="mt-5">
          <StarRatingInput value={rating} onChange={setRating} disabled={submitting} />
        </div>

        <div className="mt-5">
          <label htmlFor="review" className="font-mono text-xs uppercase tracking-widest text-slate">
            Review (optional)
          </label>
          <textarea
            id="review"
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            disabled={submitting}
            placeholder="How did they do?"
            className="mt-1.5 w-full rounded border border-slate/25 bg-white px-3 py-2 font-body text-sm text-ink-navy placeholder:text-slate/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber"
          />
        </div>

        {error && (
          <p className="mt-3 rounded border border-alert-red/30 bg-alert-red/10 px-3 py-2 text-sm text-alert-red">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={submitting}>
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Submitting…" : "Submit Rating"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default RateVendorModal
