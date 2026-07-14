import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import Modal from "./Modal"
import FormField from "./FormField"
import Button from "./Button"
import { submitBid } from "../services/api"

function getHeuristicPriceForCategories(categories, targetCategories) {
  let total = 0
  categories.forEach(cat => {
    if (targetCategories.includes(cat.name)) {
      cat.items.forEach(item => {
        const qty = Number(item.qty) || 1
        const label = item.label.toLowerCase()
        let price = 5000 // default base
        
        if (label.includes("speaker") || label.includes("pa system") || label.includes("array")) {
          price = label.includes("line array") ? 25000 : 10000
        } else if (label.includes("subwoofer")) {
          price = 15000
        } else if (label.includes("mixer") || label.includes("console")) {
          price = label.includes("digital") ? 20000 : 8000
        } else if (label.includes("mic") || label.includes("microphone")) {
          price = label.includes("wireless") ? 5000 : 1500
        } else if (label.includes("screen") || label.includes("projector") || label.includes("led wall")) {
          price = label.includes("led screen") || label.includes("led wall") ? 75000 : 25000
        } else if (label.includes("light") || label.includes("par") || label.includes("moving head")) {
          price = label.includes("moving head") ? 8000 : 2000
        } else if (label.includes("generator") || label.includes("power")) {
          price = 45000
        } else if (label.includes("stage") || label.includes("deck") || label.includes("truss")) {
          price = 30000
        }
        
        total += price * qty
      })
    }
  })
  return total
}

function BidSubmissionModal({ event, initialCategories = [], vendor, onClose, onSubmitted }) {
  const allCategoryNames = event.plan.categories.map((c) => c.name)
  const [selectedCategories, setSelectedCategories] = useState(initialCategories.length > 0 ? initialCategories : allCategoryNames)
  
  const [price, setPrice] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Recalculate range based on selected categories
  const totalHeuristic = getHeuristicPriceForCategories(event.plan.categories, allCategoryNames)
  const selectedHeuristic = getHeuristicPriceForCategories(event.plan.categories, selectedCategories)
  const ratio = totalHeuristic > 0 ? (selectedHeuristic / totalHeuristic) : 1

  const priceLow = event.plan.priceRange?.low || (selectedHeuristic * 0.85)
  const priceHigh = event.plan.priceRange?.high || (selectedHeuristic * 1.15)
  
  const adjustedLow = Math.round((priceLow * ratio) / 100) * 100
  const adjustedHigh = Math.round((priceHigh * ratio) / 100) * 100

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
    if (selectedCategories.length === 0) {
      setError("Please select at least one category to bid on.")
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
      bidCategories: selectedCategories,
    })
    setSubmitting(false)
    onSubmitted({ ...bid, eventId: event.id, eventName: event.name })
  }

  return (
    <Modal title={`Bid on ${event.name}`} onClose={onClose}>
      <p className="font-mono text-xs text-slate">
        Estimated range for selected categories: {formatLKR(adjustedLow)}
        {" – "}
        {formatLKR(adjustedHigh)}
      </p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Category checkable pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate font-mono">
            Select Categories to Bid On
          </label>
          <div className="flex flex-wrap gap-2">
            {allCategoryNames.map((catName) => {
              const isChecked = selectedCategories.includes(catName)
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => {
                    if (isChecked) {
                      if (selectedCategories.length > 1) {
                        setSelectedCategories(selectedCategories.filter(c => c !== catName))
                      }
                    } else {
                      setSelectedCategories([...selectedCategories, catName])
                    }
                  }}
                  className={`rounded border px-2.5 py-1 text-xs font-mono tracking-wide transition-all ${
                    isChecked
                      ? "border-circuit-teal bg-circuit-teal/10 text-circuit-teal font-semibold shadow-sm"
                      : "border-slate/15 bg-transparent text-slate hover:bg-slate/5"
                  }`}
                >
                  {catName}
                </button>
              )
            })}
          </div>
        </div>

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

function formatLKR(n) {
  return "Rs. " + Number(n).toLocaleString("en-LK", { maximumFractionDigits: 0 })
}

export default BidSubmissionModal
