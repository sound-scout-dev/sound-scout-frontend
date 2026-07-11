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
      className="group flex flex-col rounded-md border border-slate/15 bg-white p-5 transition-colors duration-150 ease-out hover:border-signal-amber/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-ink-navy">{event.name}</h3>
        <ArrowUpRight
          size={18}
          className="shrink-0 text-slate/40 transition-colors duration-150 ease-out group-hover:text-signal-amber"
        />
      </div>

      <p className="mt-1 font-mono text-xs text-slate">{event.eventType}</p>

      <div className="mt-4 space-y-1.5 font-mono text-xs text-slate">
        <div className="flex items-center gap-2">
          <CalendarDays size={13} strokeWidth={2} />
          {formatDate(event.date)}
        </div>
        <div className="flex items-center gap-2">
          <Users size={13} strokeWidth={2} />
          {event.crowdSize.toLocaleString()} guests
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} strokeWidth={2} />
          {event.location}
        </div>
      </div>

      <div className="mt-4">
        <StatusBadge status={event.status} />
      </div>
    </Link>
  )
}

export default EventCard
