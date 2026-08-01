import { useState } from "react"
import { Loader2, ShieldCheck, Download, Layers, Receipt, CheckCircle2, CreditCard, MessageSquare } from "lucide-react"
import Modal from "./Modal"
import Button from "./Button"
import { bookInstantRental } from "../services/api"
import { downloadRentalReceiptPDF } from "../utils/downloadReceipt"
import { useAuth } from "../context/AuthContext"

function BookingConfirmModal({ listing, onClose, onBooked }) {
  const { user } = useAuth()
  const [booking, setBooking] = useState(false)
  const maxQty = Number(listing.qty) || 1
  const [selectedQty, setSelectedQty] = useState(1)
  const [rentalDays, setRentalDays] = useState(1)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMode, setPaymentMode] = useState("advance") // "advance" (50%) | "full" (100%)
  const [completedTxn, setCompletedTxn] = useState(null)

  // Card Payment details states
  const [cardName, setCardName] = useState(user?.name || "")
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242")
  const [cardExpiry, setCardExpiry] = useState("12/28")
  const [cardCvv, setCardCvv] = useState("789")

  const itemSubtotal = (Number(listing.pricePerDay) || 0) * selectedQty * rentalDays
  const insuranceFee = Math.round(itemSubtotal * 0.05) // 5% SoundScout escrow & insurance fee
  const totalPrice = itemSubtotal + insuranceFee

  const depositPaid = paymentMode === "advance" ? Math.round(totalPrice * 0.5) : totalPrice
  const balanceDue = totalPrice - depositPaid

  async function handleConfirm() {
    setBooking(true)
    try {
      const res = await bookInstantRental(listing.id, selectedQty, rentalDays, paymentMode === "advance" ? "50% Advance Escrow Deposit" : "100% Full Escrow Payment")
      
      const txnDetails = {
        receiptNo: "RENT-2026-" + Math.floor(1000 + Math.random() * 9000),
        txnId: "TXN_RENT_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" }),
        vendorName: listing.vendorName || "Rental Shop",
        vendorPhone: res?.vendorPhone || listing.vendorPhone || "",
        renterName: user?.name || "SoundScout Customer",
        equipmentName: listing.equipmentSummary || listing.category || "Instant Rental Equipment",
        qty: selectedQty,
        days: rentalDays,
        pricePerDay: Number(listing.pricePerDay) || 0,
        subtotal: itemSubtotal,
        insuranceFee,
        totalPrice,
        paymentMode: paymentMode === "advance" ? "50% Advance Escrow Deposit" : "100% Full Escrow Payment",
        depositPaid,
        balanceDue,
        status: "PAID & RESERVED (IN ESCROW)"
      }

      setCompletedTxn(txnDetails)
      onBooked(listing.id)
    } catch (err) {
      console.error("Booking error:", err)
    } finally {
      setBooking(false)
    }
  }

  function handleDownloadReceipt() {
    if (completedTxn) {
      downloadRentalReceiptPDF(completedTxn)
    }
  }

  const cleanVendorPhone = completedTxn?.vendorPhone ? String(completedTxn.vendorPhone).replace(/\D/g, "") : ""
  const vendorWhatsappUrl = cleanVendorPhone ? `https://api.whatsapp.com/send?phone=${cleanVendorPhone}&text=${encodeURIComponent(`Hi ${completedTxn?.vendorName}, I just booked your rental item "${completedTxn?.equipmentName}" on SoundScout! My Receipt No is ${completedTxn?.receiptNo}.`)}` : "#"

  return (
    <Modal title={completedTxn ? "Rental Confirmed & Escrow Receipt" : "Instant Rental Financial Ledger"} onClose={onClose}>
      {completedTxn ? (
        <div className="space-y-6 text-center py-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={38} className="text-emerald-500" />
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-ink-navy">Instant Rental Confirmed!</h3>
            <p className="mt-1 font-body text-xs text-slate">
              Your payment of <span className="font-mono font-bold text-ink-navy">Rs. {completedTxn.depositPaid.toLocaleString()}</span> has been safely locked in SoundScout Escrow.
            </p>
          </div>

          <div className="rounded-xl border border-slate/15 bg-slate/5 p-4 text-left font-mono text-xs text-ink-navy space-y-2">
            <div className="flex justify-between">
              <span className="text-slate font-sans">Txn ID:</span>
              <span className="font-bold">{completedTxn.txnId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate font-sans">Receipt No:</span>
              <span className="font-bold text-circuit-teal">{completedTxn.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate font-sans">Escrow Deposit:</span>
              <span className="font-bold text-emerald-600">Rs. {completedTxn.depositPaid.toLocaleString()}</span>
            </div>
            {completedTxn.balanceDue > 0 && (
              <div className="flex justify-between text-alert-red">
                <span className="font-sans">Pickup Balance Due:</span>
                <span className="font-bold">Rs. {completedTxn.balanceDue.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {cleanVendorPhone && (
              <a
                href={vendorWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-display text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#20bd5a]"
              >
                <MessageSquare size={18} /> Contact Vendor on WhatsApp
              </a>
            )}
            <Button type="button" variant="primary" size="md" onClick={handleDownloadReceipt} className="w-full flex items-center justify-center gap-2">
              <Download size={16} /> Download Soft Copy Receipt (PDF)
            </Button>
            <Button type="button" variant="outline-dark" size="md" onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Vendor Item Details Card */}
          <div className="rounded-xl border border-slate/15 bg-slate/5 p-4 flex gap-4 items-center">
            {(listing.photoUrl || (Array.isArray(listing.photos) && listing.photos[0])) && (
              <img 
                src={listing.photoUrl || listing.photos[0]} 
                alt={listing.equipmentSummary} 
                className="w-20 h-20 object-cover rounded-lg border border-slate/15 shrink-0" 
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-circuit-teal bg-circuit-teal/10 px-2 py-0.5 rounded">
                {listing.category}
              </span>
              <p className="mt-1 font-display text-sm font-bold text-ink-navy truncate">{listing.vendorName}</p>
              <p className="font-body text-xs text-slate truncate">{listing.equipmentSummary}</p>
              <p className="mt-1 font-mono text-xs font-semibold text-ink-navy">
                Rs. {listing.pricePerDay?.toLocaleString()} <span className="font-normal text-slate">/day</span>
              </p>
            </div>
          </div>

          {/* Rental Duration & Quantity Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate/25 px-3 py-2 text-xs font-mono text-ink-navy outline-none focus:border-circuit-teal"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-slate mb-1">
                Rental Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={rentalDays}
                onChange={(e) => setRentalDays(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-slate/25 px-3 py-2 text-xs font-mono text-ink-navy outline-none focus:border-circuit-teal"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate/15 bg-white p-3">
            <span className="font-body text-xs font-medium text-ink-navy flex items-center gap-1.5">
              <Layers size={14} className="text-circuit-teal" /> Quantity (Max {maxQty}):
            </span>
            <input 
              type="number" 
              min="1" 
              max={maxQty} 
              value={selectedQty} 
              onChange={(e) => setSelectedQty(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
              className="w-20 rounded border border-slate/25 px-2 py-1 text-xs font-mono text-center font-bold text-ink-navy outline-none focus:border-circuit-teal"
            />
          </div>

          {/* Escrow Payment Option Selection */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-slate mb-2">
              Escrow Payment Structure
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setPaymentMode("advance")}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${paymentMode === 'advance' ? 'border-circuit-teal bg-circuit-teal/5 ring-1 ring-circuit-teal' : 'border-slate/20 hover:border-slate/40'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-ink-navy">50% Advance Escrow</span>
                  <span className="h-3 w-3 rounded-full border border-circuit-teal flex items-center justify-center">
                    {paymentMode === 'advance' && <span className="h-2 w-2 rounded-full bg-circuit-teal" />}
                  </span>
                </div>
                <p className="mt-1 font-body text-[11px] text-slate">Pay 50% deposit now; balance due at gear pickup.</p>
              </div>

              <div 
                onClick={() => setPaymentMode("full")}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${paymentMode === 'full' ? 'border-circuit-teal bg-circuit-teal/5 ring-1 ring-circuit-teal' : 'border-slate/20 hover:border-slate/40'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-ink-navy">100% Full Escrow</span>
                  <span className="h-3 w-3 rounded-full border border-circuit-teal flex items-center justify-center">
                    {paymentMode === 'full' && <span className="h-2 w-2 rounded-full bg-circuit-teal" />}
                  </span>
                </div>
                <p className="mt-1 font-body text-[11px] text-slate">Pay 100% now; fully protected in SoundScout Escrow.</p>
              </div>
            </div>
          </div>

          {/* Credit / Debit Card Details Section */}
          <div className="rounded-xl border border-slate/20 bg-slate/5 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate/10 pb-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-navy flex items-center gap-1.5">
                <CreditCard size={14} className="text-circuit-teal" /> Escrow Payment Card Details
              </span>
              <span className="font-mono text-[10px] text-emerald-600 font-semibold">256-bit Encrypted</span>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-slate mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Name on card"
                className="w-full rounded border border-slate/25 bg-white px-3 py-1.5 text-xs text-ink-navy outline-none focus:border-circuit-teal"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block font-mono text-[10px] uppercase text-slate mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded border border-slate/25 bg-white px-3 py-1.5 text-xs font-mono text-ink-navy outline-none focus:border-circuit-teal"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-slate mb-1">Expiry / CVV</label>
                <input
                  type="text"
                  value={`${cardExpiry} ${cardCvv}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(" ")
                    setCardExpiry(parts[0] || "")
                    setCardCvv(parts[1] || "")
                  }}
                  placeholder="MM/YY CVV"
                  className="w-full rounded border border-slate/25 bg-white px-2 py-1.5 text-xs font-mono text-center text-ink-navy outline-none focus:border-circuit-teal"
                />
              </div>
            </div>
          </div>

          {/* Financial Breakdown Ledger */}
          <div className="rounded-xl border border-slate/15 bg-white p-4 font-mono text-xs space-y-2">
            <div className="flex justify-between text-slate">
              <span>Item Subtotal ({selectedQty} qty × {rentalDays} days):</span>
              <span>Rs. {itemSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate">
              <span>SoundScout Escrow & Insurance Fee (5%):</span>
              <span>Rs. {insuranceFee.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate/10 pt-2 flex justify-between font-bold text-ink-navy text-sm">
              <span>Total Booking Valuation:</span>
              <span>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-600 pt-1">
              <span>Escrow Deposit Payable Now:</span>
              <span>Rs. {depositPaid.toLocaleString()}</span>
            </div>
            {balanceDue > 0 && (
              <div className="flex justify-between text-alert-red text-[11px]">
                <span>Remaining Balance Due at Pickup:</span>
                <span>Rs. {balanceDue.toLocaleString()}</span>
              </div>
            )}
          </div>

          <p className="flex items-center gap-1.5 font-body text-xs text-slate">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            Protected by SoundScout Escrow & Instant Replacement Guarantee.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline-dark" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="secondary" size="md" disabled={booking} onClick={handleConfirm}>
              {booking ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
              {booking ? "Processing Escrow…" : `Pay Rs. ${depositPaid.toLocaleString()} Deposit`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default BookingConfirmModal
