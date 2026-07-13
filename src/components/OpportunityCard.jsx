import { CalendarDays, MapPin, Users, CheckCircle2 } from "lucide-react"
import Button from "./Button"

function formatLKR(n) {
  return "Rs. " + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function OpportunityCard({ event, hasBid, onPlaceBid }) {
  return (
    <div className="flex flex-col rounded-md border border-slate/15 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-navy">{event.name}</h3>
          <p className="mt-0.5 font-mono text-xs text-slate">{event.eventType}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {event.plan.categories.map((cat) => (
            <span
              key={cat.name}
              className="rounded border border-circuit-teal/30 bg-circuit-teal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-circuit-teal"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs text-slate">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={13} strokeWidth={2} />
          {formatDate(event.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} strokeWidth={2} />
          {event.crowdSize.toLocaleString()} guests
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={13} strokeWidth={2} />
          {event.location}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded border border-signal-amber/30 bg-signal-amber/10 px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-slate">Est. cost</span>
        <span className="font-mono text-sm font-semibold text-ink-navy">
          {formatLKR(event.plan.priceRange.low)} – {formatLKR(event.plan.priceRange.high)}
        </span>
      </div>

      <div className="mt-4">
        {hasBid ? (
          <span className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-circuit-teal">
            <CheckCircle2 size={15} strokeWidth={2} />
            Bid submitted
          </span>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => onPlaceBid(event)}>
            Place Bid
          </Button>
        )}
      </div>
    </div>
  )
}

export default OpportunityCard
