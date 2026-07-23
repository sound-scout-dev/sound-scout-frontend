import { Star, Check, Loader2 } from "lucide-react"
import Button from "./Button"

function formatLKR(n) {
  return "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 })
}

function BidCard({ bid, canAccept, accepting, onAccept }) {
  const isAccepted = bid.status === "accepted"
  const isDeclined = bid.status === "declined"

  let categories = []
  if (bid.bid_categories) {
    categories = typeof bid.bid_categories === "string"
      ? JSON.parse(bid.bid_categories)
      : bid.bid_categories
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 border-b border-slate/10 p-5 last:border-b-0 sm:grid-cols-[1.4fr_1fr_1.6fr_auto] sm:items-center ${
        isDeclined ? "opacity-50" : ""
      } ${isAccepted ? "bg-circuit-teal/5" : ""}`}
    >
      <div>
        <p className="font-display text-sm font-semibold text-ink-navy">{bid.vendorName}</p>
        <p className="mt-1 flex items-center gap-1 font-mono text-xs text-slate">
          {bid.ratingCount > 0 ? (
            <>
              <Star size={13} className="fill-signal-amber text-signal-amber" />
              {bid.rating.toFixed(1)} / 5
              <span className="text-slate/60">({bid.ratingCount})</span>
            </>
          ) : (
            <span className="text-slate/60">New vendor · no ratings yet</span>
          )}
        </p>
        {categories.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded border border-circuit-teal/30 bg-circuit-teal/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-circuit-teal"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="font-mono text-base font-semibold text-ink-navy">{formatLKR(bid.price)}</p>

      <p className="font-body text-sm text-slate">{bid.notes}</p>

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
  )
}

export default BidCard
