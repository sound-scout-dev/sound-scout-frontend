import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, CalendarPlus, Crown, Check } from "lucide-react"
import Button from "../../components/Button"
import EventCard from "../../components/EventCard"
import PremiumCheckoutModal, { PREMIUM_FEATURES, PREMIUM_PRICE_LKR } from "../../components/PremiumCheckoutModal"
import { useAuth } from "../../context/AuthContext"
import { listOrganizerEvents, subscribePremium, cancelPremium } from "../../services/api"
import FullPageLoader from "../../components/FullPageLoader"
import OnboardingTour from "../../components/OnboardingTour"
import { organizerDashboardSteps } from "../../onboarding/tourSteps"

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

// Premium had no entry point anywhere outside the Blueprint page itself, so an
// organizer could only discover it by stumbling into an outdoor event. This is
// the advert; it also doubles as the subscription's status/manage row.
function PremiumBanner() {
  const { user, updateUser } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const expires = user?.subscription_expires_at
    ? new Date(user.subscription_expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null

  function handleConfirmed() {
    return subscribePremium().then((res) => {
      updateUser({ is_premium: true, subscription_expires_at: res.subscription_expires_at })
      setCheckoutOpen(false)
    })
  }

  function handleCancel() {
    if (!window.confirm("Cancel Premium? You'll lose access to the AI Venue Blueprint.")) return
    setBusy(true)
    cancelPremium()
      .then(() => updateUser({ is_premium: false, subscription_expires_at: null }))
      .finally(() => setBusy(false))
  }

  if (user?.is_premium) {
    return (
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-signal-amber/30 bg-signal-amber/5 px-5 py-3">
        <p className="flex items-center gap-2 font-mono text-xs text-slate">
          <Crown size={14} className="text-signal-amber" />
          <span className="font-semibold text-ink-navy dark:text-white">Premium active</span>
          {expires && <span>· renews {expires}</span>}
        </p>
        <button
          onClick={handleCancel}
          disabled={busy}
          className="font-mono text-[11px] text-slate underline underline-offset-2 hover:text-alert-red disabled:opacity-60"
        >
          {busy ? "Cancelling…" : "Cancel subscription"}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-signal-amber/30 bg-gradient-to-r from-signal-amber/10 to-transparent p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-[16rem] flex-1">
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-signal-amber">
            <Crown size={13} /> SoundScout Premium
          </p>
          <h2 className="mt-2 font-display text-lg font-semibold text-ink-navy dark:text-white">
            Turn a drone photo into an exact stage &amp; speaker plan
          </h2>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 font-body text-xs text-slate">
                <Check size={13} className="mt-0.5 shrink-0 text-circuit-teal" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-2">
          <p className="font-display text-xl font-semibold text-ink-navy dark:text-white">
            Rs. {PREMIUM_PRICE_LKR.toLocaleString()}
            <span className="font-mono text-xs font-normal text-slate"> / month</span>
          </p>
          <Button onClick={() => setCheckoutOpen(true)}>Upgrade to Premium</Button>
        </div>
      </div>
      <PremiumCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onConfirmed={handleConfirmed}
      />
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

  useEffect(() => {
    let active = true
    listOrganizerEvents().then((data) => {
      if (active) {
        setEvents(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <FullPageLoader message="SYNCING EVENTS..." />
  }

  const visibleEvents = events

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in-up">
      <OnboardingTour tourKey="organizer-dashboard" steps={organizerDashboardSteps} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-navy sm:text-3xl">
            Your events
          </h1>
          <p className="mt-1 font-body text-sm text-slate">
            Track plans from first draft through booked vendor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button as={Link} to="/organizer/events/new" variant="primary" size="md" data-tour="new-event-button">
            <Plus size={16} strokeWidth={2.5} />
            New Event
          </Button>
        </div>
      </div>

      <PremiumBanner />

      <div className="mt-8" data-tour="events-list">
        {loading ? (
          <DashboardSkeleton />
        ) : visibleEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrganizerDashboard
