import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, CalendarPlus, Star } from "lucide-react"
import Button from "../../components/Button"
import EventCard from "../../components/EventCard"
import RateVendorModal from "../../components/RateVendorModal"
import { listOrganizerEvents, listPendingRatings } from "../../services/api"

function formatLKR(n) {
  return "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 })
}

function PendingRatings({ items, onRate }) {
  if (items.length === 0) return null

  return (
    <div className="mb-8 rounded-md border border-signal-amber/30 bg-signal-amber/5 p-5">
      <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-ink-navy">
        <Star size={16} className="fill-signal-amber text-signal-amber" />
        Rate your vendors
      </h2>
      <p className="mt-1 font-body text-xs text-slate">
        These events have passed — let other organizers know how these vendors performed.
      </p>
      <div className="mt-4 divide-y divide-slate/10">
        {items.map((item) => (
          <div
            key={`${item.eventId}-${item.vendorId}`}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div>
              <p className="font-display text-sm font-medium text-ink-navy">{item.vendorName}</p>
              <p className="font-mono text-xs text-slate">
                {item.eventType} · {formatLKR(item.price)}
                {item.eventDate ? ` · ${new Date(item.eventDate).toLocaleDateString()}` : ""}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onRate(item)}>
              Rate vendor
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-md border border-slate/15 bg-white p-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate/10" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate/10" />
          <div className="mt-6 space-y-2">
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate/10" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate/10" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-slate/10" />
          </div>
          <div className="mt-4 h-5 w-24 animate-pulse rounded bg-slate/10" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-slate/25 bg-white px-6 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-amber/15 text-signal-amber">
        <CalendarPlus size={22} strokeWidth={2} />
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink-navy">
        No events yet
      </h2>
      <p className="mt-1.5 max-w-sm font-body text-sm text-slate">
        Create your first event and let the AI consultant put together a full
        infrastructure plan for it.
      </p>
      <Button as={Link} to="/organizer/events/new" variant="primary" size="md" className="mt-6">
        <Plus size={16} strokeWidth={2.5} />
        New Event
      </Button>
    </div>
  )
}

function OrganizerDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingRatings, setPendingRatings] = useState([])
  const [ratingTarget, setRatingTarget] = useState(null)

  useEffect(() => {
    let active = true
    listOrganizerEvents().then((data) => {
      if (active) {
        setEvents(data)
        setLoading(false)
      }
    })
    listPendingRatings().then((data) => {
      if (active) setPendingRatings(data)
    })
    return () => {
      active = false
    }
  }, [])

  function handleRatingSubmitted(item) {
    setPendingRatings((prev) =>
      prev.filter((p) => !(p.eventId === item.eventId && p.vendorId === item.vendorId))
    )
    setRatingTarget(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-navy sm:text-3xl">
            Your events
          </h1>
          <p className="mt-1 font-body text-sm text-slate">
            Track plans from first draft through booked vendor.
          </p>
        </div>

        <Button as={Link} to="/organizer/events/new" variant="primary" size="md">
          <Plus size={16} strokeWidth={2.5} />
          New Event
        </Button>
      </div>

      <div className="mt-8">
        <PendingRatings items={pendingRatings} onRate={setRatingTarget} />

        {loading ? (
          <DashboardSkeleton />
        ) : events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {ratingTarget && (
        <RateVendorModal
          pendingRating={ratingTarget}
          onClose={() => setRatingTarget(null)}
          onSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  )
}

export default OrganizerDashboard
