import { useState } from "react"
import { Loader2, CreditCard, ShieldCheck, X } from "lucide-react"

function formatLKR(n) {
  return "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 })
}

function AcceptBidModal({ isOpen, onClose, bid, onPaymentSuccess }) {
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState("invoice") // invoice -> checkout -> success

  if (!isOpen || !bid) return null

  const quotePrice = bid.price
  const commission = quotePrice * 0.06
  const total = quotePrice + commission

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "")
    // Format card number with spaces every 4 digits
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val
    setCardNumber(formatted.slice(0, 19))
  }

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "")
    if (val.length > 2) {
      val = val.slice(0, 2) + "/" + val.slice(2, 4)
    }
    setExpiry(val.slice(0, 5))
  }

  const handleCvcChange = (e) => {
    setCvc(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Please enter a valid 16-digit card number.")
      return
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Please enter a valid expiry date (MM/YY).")
      return
    }
    if (cvc.length !== 3) {
      setError("Please enter a valid 3-digit CVC.")
      return
    }

    setError("")
    setSubmitting(true)

    // Simulate Payment Gateway Authorization Delay
    setTimeout(() => {
      const mockTxnId = "TXN_DEMO_" + Math.random().toString(36).substr(2, 9).toUpperCase()
      setStep("success")
      setSubmitting(false)
      // Invoke payment callback
      onPaymentSuccess(mockTxnId)
    }, 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-navy/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-md border border-slate/15 bg-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate/10 p-5">
          <h2 className="font-display text-base font-semibold text-ink-navy flex items-center gap-2">
            <ShieldCheck className="text-circuit-teal" size={18} />
            Escrow Deposit Gate
          </h2>
          {step !== "success" && (
            <button onClick={onClose} className="text-slate hover:text-ink-navy">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Invoice Step */}
        {step === "invoice" && (
          <div className="p-6 space-y-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-slate">Selected Bid</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink-navy">{bid.vendorName}</h3>
            </div>

            <div className="rounded border border-slate/10 bg-slate/5 p-4 space-y-3 font-body text-sm">
              <div className="flex justify-between text-slate">
                <span>Vendor Bid Quote</span>
                <span className="font-mono font-medium">{formatLKR(quotePrice)}</span>
              </div>
              <div className="flex justify-between text-slate">
                <span>Platform Commission (6%)</span>
                <span className="font-mono font-medium">{formatLKR(commission)}</span>
              </div>
              <div className="border-t border-slate/10 pt-2.5 flex justify-between font-display text-base font-semibold text-ink-navy">
                <span>Escrow Total Payable</span>
                <span className="font-mono text-circuit-teal">{formatLKR(total)}</span>
              </div>
            </div>

            <div className="text-xs text-slate bg-circuit-teal/5 border border-circuit-teal/10 rounded p-3 leading-relaxed">
              💡 **Escrow Gate Protection:** Paying the deposit secures your equipment booking on SoundScout. Direct contact details and the WhatsApp channel will unlock immediately upon verification of payment.
            </div>

            <button
              onClick={() => setStep("checkout")}
              className="w-full rounded bg-ink-navy py-2.5 font-sans text-sm font-semibold text-white hover:bg-ink-navy/90 transition-colors"
            >
              Proceed to Secure Payment
            </button>
          </div>
        )}

        {/* Checkout / Card Input Step */}
        {step === "checkout" && (
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
            <div className="flex justify-between border-b border-slate/10 pb-3 mb-1">
              <span className="text-xs text-slate font-mono uppercase">Deposit Total</span>
              <span className="text-sm font-semibold text-ink-navy font-mono">{formatLKR(total)}</span>
            </div>

            {error && (
              <p className="font-mono text-xs text-alert-red bg-alert-red/10 rounded px-2.5 py-1.5 text-left">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-widest text-slate">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4111 2222 3333 4444"
                    className="w-full rounded border border-slate/25 bg-white pl-10 pr-3 py-2 text-sm font-mono text-ink-navy transition-colors focus-visible:outline-2 focus-visible:outline-signal-amber"
                  />
                  <CreditCard className="absolute left-3 top-2.5 text-slate/50" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-widest text-slate">Expiry Date</label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full rounded border border-slate/25 bg-white px-3 py-2 text-sm font-mono text-ink-navy transition-colors focus-visible:outline-2 focus-visible:outline-signal-amber"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-widest text-slate">CVC / CVV</label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder="123"
                    className="w-full rounded border border-slate/25 bg-white px-3 py-2 text-sm font-mono text-ink-navy transition-colors focus-visible:outline-2 focus-visible:outline-signal-amber"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep("invoice")}
                className="w-1/3 rounded border border-slate/20 py-2.5 font-sans text-sm font-semibold text-slate hover:bg-slate/5 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 rounded bg-circuit-teal py-2.5 font-sans text-sm font-semibold text-white hover:bg-circuit-teal/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-80"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="p-6 text-center space-y-5">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] animate-bounce">
              <ShieldCheck size={32} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-ink-navy">Payment Authorized!</h3>
              <p className="mt-1.5 font-body text-xs text-slate max-w-xs mx-auto leading-relaxed">
                Platform fee of **6%** has been locked in escrow. Direct contact details and the WhatsApp compose links are now unlocked on your dashboard.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded bg-[#25D366] py-2.5 font-sans text-sm font-semibold text-white hover:bg-[#20ba5a] transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default AcceptBidModal
