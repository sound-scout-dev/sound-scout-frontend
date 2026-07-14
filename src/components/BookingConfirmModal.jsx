import { useState } from "react"
import { Loader2, Zap } from "lucide-react"
import Modal from "./Modal"
import Button from "./Button"
import { bookInstantRental } from "../services/api"

function BookingConfirmModal({ listing, onClose, onBooked }) {
  const [booking, setBooking] = useState(false)
  const maxQty = Number(listing.qty) || 1
  const [selectedQty, setSelectedQty] = useState(1)

  async function handleConfirm() {
    setBooking(true)
    await bookInstantRental(listing.id, selectedQty)
    setBooking(false)
    onBooked(listing.id)
  }

  return (
    <Modal title="Confirm instant booking" onClose={onClose}>
      <div className="rounded border border-alert-red/25 bg-alert-red/5 p-4">
        <p className="font-display text-sm font-semibold text-ink-navy">{listing.vendorName}</p>
        <p className="mt-1 font-body text-sm text-slate">{listing.equipmentSummary}</p>
        <p className="mt-3 flex items-center justify-between font-mono text-lg font-semibold text-ink-navy">
          <span>
            Rs. {listing.pricePerDay}
            <span className="text-sm font-normal text-slate">/day/unit</span>
          </span>
          <div className="flex items-center gap-2 text-sm font-body font-normal">
            <label htmlFor="qty" className="text-slate">Qty:</label>
            <input 
              id="qty"
              type="number" 
              min="1" 
              max={maxQty} 
              value={selectedQty} 
              onChange={(e) => setSelectedQty(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
              className="w-16 rounded border border-slate/25 px-2 py-1 outline-none focus:border-signal-amber"
            />
          </div>
        </p>
      </div>

      <div className="mt-3 flex justify-between font-body text-sm font-semibold text-ink-navy">
        <span>Total:</span>
        <span className="font-mono text-base">Rs. {listing.pricePerDay * selectedQty}</span>
      </div>

      <p className="mt-4 flex items-start gap-2 font-body text-sm text-slate">
        <Zap size={16} className="mt-0.5 shrink-0 text-alert-red" strokeWidth={2} />
        This vendor will call or message you within 15 minutes to confirm delivery details.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline-dark" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="danger" size="md" disabled={booking} onClick={handleConfirm}>
          {booking && <Loader2 size={16} className="animate-spin" />}
          {booking ? "Booking…" : "Confirm Booking"}
        </Button>
      </div>
    </Modal>
  )
}

export default BookingConfirmModal
