import { useState } from "react"
import { CalendarDays, MapPin, Users, ChevronDown } from "lucide-react"
import SpecCard from "./SpecCard"

function formatUSD(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function EventPlanSummary({ event, plan }) {
  const [expanded, setExpanded] = useState(false)
  const itemCount = plan.categories.reduce((n, cat) => n + cat.items.length, 0)

  return (
    <div className="rounded-md border border-slate/15 bg-white">
      <div className="p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-slate">{event.eventType}</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-ink-navy">{event.name}</h2>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-slate">
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

        <div className="mt-5 flex items-center justify-between rounded border border-signal-amber/30 bg-signal-amber/10 px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate">
            Estimated cost · {plan.categories.length} categories, {itemCount} items
          </span>
          <span className="font-mono text-base font-semibold text-ink-navy">
            {formatUSD(plan.priceRange.low)} – {formatUSD(plan.priceRange.high)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-4 flex items-center gap-1.5 rounded font-mono text-xs font-medium uppercase tracking-widest text-circuit-teal transition-colors duration-150 ease-out hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber"
        >
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className={`transition-transform duration-150 ease-out ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Hide full spec sheet" : "View full spec sheet"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate/10 p-6 pt-5">
          <SpecCard plan={plan} loop={false} startRevealed />
        </div>
      )}
    </div>
  )
}

export default EventPlanSummary
