import { useState } from "react"
import { Star, Check, Loader2, Award, ChevronDown, ChevronUp } from "lucide-react"
import Button from "./Button"
import { getVendorReviews } from "../services/api"

function formatLKR(n) {
  return "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 })
}

function sanitizeWhatsAppPhone(phone) {
  if (!phone) return ""
  const str = String(phone)
  // Reject internal Baileys LIDs (contain @lid or are 14+ digits)
  if (str.includes('@lid') || str.replace(/\D/g, '').length >= 14) return ""
  let clean = str.replace(/[^0-9]/g, "")
  if (clean.startsWith("0")) clean = "94" + clean.slice(1)
  else if (clean.length === 9 && clean.startsWith("7")) clean = "94" + clean
  // Final sanity check — must be 11-12 digits for Sri Lanka
  if (clean.length < 9 || clean.length > 13) return ""
  return clean
}

function BidCard({ bid, canAccept, accepting, onAccept }) {
  const isAccepted = bid.status === "accepted"
  const isDeclined = bid.status === "declined"
  const [showReviews, setShowReviews] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  const toggleReviews = () => {
    if (!showReviews && reviews.length === 0 && bid.vendorId) {
      setLoadingReviews(true)
      getVendorReviews(bid.vendorId)
        .then((res) => {
          setReviews(res || [])
          setLoadingReviews(false)
        })
        .catch(() => setLoadingReviews(false))
    }
    setShowReviews(!showReviews)
  }

  return (
    <div
      className={`border-b border-slate/10 last:border-b-0 ${isDeclined ? "opacity-60" : ""
        } ${isAccepted ? "bg-circuit-teal/5" : ""}`}
    >
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[1.4fr_1fr_1.6fr_auto] sm:items-center">
        <div>
          <div className="font-display text-sm font-semibold text-ink-navy flex flex-wrap items-center gap-2">
            <span>{bid.vendorName}</span>

            {/* Premium Gold Verified Badge */}
            {bid.isPremium && (
              <span className="inline-flex items-center gap-1 rounded bg-signal-amber/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-signal-amber border border-signal-amber/20 animate-pulse">
                <Award size={10} />
                Verified Premium
              </span>
            )}

            {bid.vendorPhone && (
              <a
                href={`https://api.whatsapp.com/send?phone=${sanitizeWhatsAppPhone(bid.vendorPhone)}&text=${encodeURIComponent(
                  `Hi ${bid.vendorName}, I'm the organizer of the event on SoundScout. I'm messaging regarding the bid of Rs. ${bid.price.toLocaleString()} you placed.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25D366]/10 p-1.5 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                title="Chat on WhatsApp"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.835-4.577c1.611.956 3.197 1.48 4.793 1.48 5.517 0 10.005-4.486 10.008-10.004.002-2.673-1.031-5.187-2.908-7.065C16.858 2.055 14.348.99 11.693.99c-5.522 0-10.01 4.486-10.013 10.006-.001 1.77.462 3.5 1.34 5.018l-1.011 3.686 3.784-.992zm11.233-7.25c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.569-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
              </a>
            )}
          </div>

          <button
            onClick={toggleReviews}
            className="mt-1 flex items-center gap-1 font-mono text-xs text-slate hover:text-ink-navy transition-colors focus:outline-none"
          >
            <Star size={13} className="fill-signal-amber text-signal-amber" />
            {Number(bid.rating).toFixed(1)} / 5
            <span className="text-[10px] underline ml-1 flex items-center">
              (reviews)
              {showReviews ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </button>

          {/* Bid Categories & Items Tags */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {(bid.bid_categories || []).map((cat) => (
              <span key={cat} className="rounded bg-[#25D366]/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#1e8d44] border border-[#25D366]/20">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <p className="font-mono text-base font-semibold text-ink-navy">{formatLKR(bid.price)}</p>

        <div className="space-y-1.5 text-left">
          <p className="font-body text-sm text-slate">{bid.notes}</p>

          {/* Bid Items details */}
          {bid.bidItems && bid.bidItems.length > 0 && (
            <div className="pt-1.5">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-slate/80">Proposed Equipment:</span>
              <ul className="mt-1 list-disc pl-4 text-xs font-sans text-slate space-y-0.5">
                {bid.bidItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="sm:justify-self-end">
          {isAccepted && (
            <span className="flex items-center gap-1.5 rounded border border-circuit-teal/40 bg-circuit-teal/10 px-2.5 py-1.5 font-mono text-xs font-medium uppercase tracking-wide text-circuit-teal">
              <Check size={14} strokeWidth={2.5} />
              Accepted
            </span>
          )}
          {isDeclined && (
            <span className="font-mono text-xs uppercase tracking-wide text-slate/60">
              Not selected
            </span>
          )}
          {bid.status === "pending" && canAccept && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={accepting}
              onClick={() => onAccept(bid.id)}
            >
              {accepting && <Loader2 size={14} className="animate-spin" />}
              {accepting ? "Accepting…" : "Accept Bid"}
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Reviews section */}
      {showReviews && (
        <div className="border-t border-slate/5 bg-slate/5 p-5 space-y-3.5">
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink-navy">
            Vendor Review History
          </h4>

          {loadingReviews ? (
            <div className="flex items-center gap-2 text-xs text-slate py-2">
              <Loader2 size={12} className="animate-spin" />
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-slate font-body py-1">No reviews yet for this vendor.</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div key={rev.review_id} className="rounded border border-slate/5 bg-white p-3 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-semibold text-ink-navy">{rev.organizer_name}</span>
                    <span className="font-mono text-[10px] text-slate">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-signal-amber">
                    {Array.from({ length: Math.round(Number(rev.rating)) }).map((_, i) => (
                      <Star key={i} size={11} className="fill-current" />
                    ))}
                  </div>
                  <p className="font-body text-xs text-slate italic mt-1">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BidCard
