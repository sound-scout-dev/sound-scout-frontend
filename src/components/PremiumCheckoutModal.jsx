import { useState } from "react"
import { Loader2, CreditCard, Crown, X, Check, ShieldCheck } from "lucide-react"

export const PREMIUM_PRICE_LKR = 2500

export const PREMIUM_FEATURES = [
  "AI Venue Blueprint — drone photo to exact speaker placement in meters",
  "Delay tower, sub and FOH positions calculated from crowd depth",
  "Downloadable site plan to hand to your AV crew",
  "Priority placement of your events in vendor bid feeds",
]

// Card details are validated for shape and then discarded in the browser -- no
// card number ever leaves this component. Wire a real PSP (PayHere/Stripe)
// tokenisation call in place of the simulated authorisation before charging
// anyone for real.
function PremiumCheckoutModal({ isOpen, onClose, onConfirmed }) {
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "")
    setCardNumber((val.match(/.{1,4}/g)?.join(" ") || val).slice(0, 19))
  }

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "")
    if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4)
    setExpiry(val.slice(0, 5))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError("Enter the name printed on the card.")
    if (cardNumber.replace(/\s/g, "").length !== 16) return setError("Please enter a valid 16-digit card number.")
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return setError("Please enter a valid expiry date (MM/YY).")
    if (cvc.length !== 3) return setError("Please enter a valid 3-digit CVC.")

    setError("")
    setSubmitting(true)
    Promise.resolve(onConfirmed())
      .catch(() => setError("Could not start your subscription. Please try again."))
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-navy/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-md border border-slate/15 bg-white shadow-2xl dark:bg-[#12181f] dark:border-white/10">
        <div className="flex items-center justify-between border-b border-slate/10 p-5 dark:border-white/10">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-navy dark:text-white">
            <Crown className="text-signal-amber" size={18} />
            SoundScout Premium
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-slate hover:text-ink-navy dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-lg border border-signal-amber/30 bg-signal-amber/5 p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Monthly plan</span>
              <span className="font-display text-lg font-semibold text-ink-navy dark:text-white">
                Rs. {PREMIUM_PRICE_LKR.toLocaleString()}
                <span className="font-mono text-xs font-normal text-slate"> / month</span>
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 font-body text-xs text-slate">
                  <Check size={13} className="mt-0.5 shrink-0 text-circuit-teal" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 flex items-start gap-1.5 rounded bg-slate/5 px-2.5 py-2 font-mono text-[10px] leading-relaxed text-slate">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-circuit-teal" />
            Demo checkout — no live payment gateway is connected yet, and card details are
            never sent or stored. Do not enter a real card.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate">Name on card</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="I. Gamage"
                className="mt-1 w-full rounded border border-slate/20 bg-transparent px-3 py-2 font-mono text-sm text-ink-navy outline-none focus:border-circuit-teal dark:text-white"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate">Card number</label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                <input
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4242 4242 4242 4242"
                  className="mt-1 w-full rounded border border-slate/20 bg-transparent py-2 pl-9 pr-3 font-mono text-sm text-ink-navy outline-none focus:border-circuit-teal dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate">Expiry</label>
                <input
                  value={expiry}
                  onChange={handleExpiryChange}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="MM/YY"
                  className="mt-1 w-full rounded border border-slate/20 bg-transparent px-3 py-2 font-mono text-sm text-ink-navy outline-none focus:border-circuit-teal dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate">CVC</label>
                <input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="123"
                  className="mt-1 w-full rounded border border-slate/20 bg-transparent px-3 py-2 font-mono text-sm text-ink-navy outline-none focus:border-circuit-teal dark:text-white"
                />
              </div>
            </div>

            {error && <p className="font-mono text-xs text-alert-red">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-signal-amber px-4 py-2.5 font-display text-sm font-semibold text-ink-navy transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? "Authorising…" : `Subscribe — Rs. ${PREMIUM_PRICE_LKR.toLocaleString()}/mo`}
            </button>
            <p className="text-center font-mono text-[10px] text-slate">Cancel anytime from your profile.</p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PremiumCheckoutModal
