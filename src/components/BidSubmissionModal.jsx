import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import Modal from "./Modal"
import FormField from "./FormField"
import Button from "./Button"
import { submitBid } from "../services/api"

function BidSubmissionModal({ event, vendor, onClose, onSubmitted }) {
  const [price, setPrice] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!price) {
      setError("Enter your bid amount.")
      return
    }
    if (Number(price) <= 0) {
      setError("Enter a valid bid amount.")
      return
    }

    setError("")
    setSubmitting(true)
    const bid = await submitBid({
      eventId: event.id,
      vendorId: vendor.id,
      vendorName: vendor.name,
      price,
      notes,
      rating: vendor.rating,
    })
    setSubmitting(false)
    onSubmitted({ ...bid, eventId: event.id, eventName: event.name })
  }

  return (
    <Modal title={`Bid on ${event.name}`} onClose={onClose}>
      <p className="font-mono text-xs text-slate">
        Estimated range: Rs. {event.plan.priceRange.low.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
        {" – "}
        Rs. {event.plan.priceRange.high.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
      </p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Your bid amount (LKR)"
          name="price"
          type="number"
          min="1"
          placeholder="e.g. 18500"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={error}
        />

        <FormField
          as="textarea"
          label="Notes for the organizer"
          name="notes"
          rows={4}
          placeholder="What's included, availability, anything that sets your bid apart…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline-dark" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" size="md" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2} />}
            {submitting ? "Submitting…" : "Submit Bid"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default BidSubmissionModal
