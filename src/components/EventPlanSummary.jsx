import { useState } from "react"
import { CalendarDays, MapPin, Users, ChevronDown } from "lucide-react"
import SpecCard from "./SpecCard"

function formatLKR(n) {
  return "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 })
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
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#0891B2]">{event.eventType}</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-gray-900">{event.name}</h2>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} strokeWidth={2} className="text-gray-400" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} strokeWidth={2} className="text-gray-400" />
            {event.crowdSize.toLocaleString()} guests
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={2} className="text-gray-400" />
            {event.location}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between rounded border border-[#0891B2]/20 bg-[#0891B2]/5 px-4 py-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#0891B2]">
            Estimated cost · {plan.categories.length} categories, {itemCount} items
          </span>
          <span className="font-mono text-base font-bold text-gray-800">
            {formatLKR(plan.priceRange.low)} – {formatLKR(plan.priceRange.high)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-4 flex items-center gap-1.5 rounded font-mono text-xs font-semibold uppercase tracking-widest text-[#0891B2] transition-colors duration-150 ease-out hover:text-[#067894] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2]"
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
        <div className="border-t border-gray-100 p-6 pt-5 bg-gray-50/30 rounded-b-lg">
          <SpecCard plan={plan} loop={false} startRevealed />
        </div>
      )}
    </div>
  )
}

export default EventPlanSummary
