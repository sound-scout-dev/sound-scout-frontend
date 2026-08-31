import { Link } from "react-router-dom"
import { CalendarDays, MapPin, Users, ArrowUpRight } from "lucide-react"
import StatusBadge from "./StatusBadge"

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function EventCard({ event }) {
  return (
    <Link
      to={`/organizer/events/${event.id}`}
      className="group flex flex-col rounded-xl bg-glass p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0891B2]/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0891B2] animate-fade-in-up"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-gray-900 group-hover:text-[#0891B2] transition-colors duration-150">
          {event.name}
        </h3>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-gray-400 transition-colors duration-150 ease-out group-hover:text-[#0891B2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transform"
        />
      </div>

      <p className="mt-1 font-mono text-xs text-gray-500">{event.eventType}</p>

      <div className="mt-4 space-y-2 font-mono text-[11px] text-gray-500">
        <div className="flex items-center gap-2">
          <CalendarDays size={13} strokeWidth={2} className="text-gray-400" />
          {formatDate(event.date)}
        </div>
        <div className="flex items-center gap-2">
          <Users size={13} strokeWidth={2} className="text-gray-400" />
          {event.crowdSize.toLocaleString()} guests
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} strokeWidth={2} className="text-gray-400" />
          {event.location}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between">
        <StatusBadge status={event.status} />
        <span className="text-[10px] font-mono font-bold text-[#0891B2] opacity-0 group-hover:opacity-100 transition-opacity duration-200 uppercase tracking-wider">
          View Details &rarr;
        </span>
      </div>
    </Link>
  )
}

export default EventCard
