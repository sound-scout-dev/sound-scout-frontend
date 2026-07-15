import { useEffect, useState } from "react"
import { useParams, useLocation, Link } from "react-router-dom"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import StatusBadge from "../../components/StatusBadge"
import EventPlanSummary from "../../components/EventPlanSummary"
import BidCard from "../../components/BidCard"
import Button from "../../components/Button"
import { getEventById, listBidsForEvent, acceptBid, publishEvent } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

function DetailSkeleton() {
  return (
    <div className="rounded-md border border-slate/15 bg-white p-6">
      <div className="h-3 w-24 animate-pulse rounded bg-slate/10" />
      <div className="mt-2 h-6 w-64 animate-pulse rounded bg-slate/10" />
      <div className="mt-6 h-12 w-full animate-pulse rounded bg-slate/10" />
    </div>
  )
}

function EventDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()

  const [event, setEvent] = useState(location.state?.event ?? null)
  const [plan, setPlan] = useState(location.state?.plan ?? null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(!location.state)
  const [notFound, setNotFound] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [acceptingId, setAcceptingId] = useState(null)
  const [acceptError, setAcceptError] = useState("")

  useEffect(() => {
    if (location.state) return

    let active = true
    setLoading(true)
    Promise.all([getEventById(id), listBidsForEvent(id)]).then(([fetchedEvent, fetchedBids]) => {
      if (!active) return
      if (!fetchedEvent) {
        setNotFound(true)
      } else {
        setEvent(fetchedEvent)
        setPlan(fetchedEvent.plan)
        setBids(fetchedBids)
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function handlePublish() {
    setPublishing(true)
    publishEvent(event.id).then(() => {
      setEvent((e) => ({ ...e, status: "bidding_open" }))
      setPublishing(false)
    })
  }

  function handleAccept(bidId) {
    setAcceptingId(bidId)
    setAcceptError("")
    acceptBid(event.id, bidId, user?.id)
      .then(() => {
        setBids((prev) =>
          prev.map((b) => ({ ...b, status: b.id === bidId ? "accepted" : "declined" }))
        )
        setEvent((e) => ({ ...e, status: "booked" }))
        setAcceptingId(null)
      })
      .catch((err) => {
        setAcceptError(err.message || "Couldn't accept this bid. Please try again.")
        setAcceptingId(null)
      })
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-xl font-semibold text-ink-navy">Event not found</h1>
        <p className="mt-2 font-body text-sm text-slate">
          This event doesn't exist or may have been removed.
        </p>
        <Link
          to="/organizer/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 font-medium text-ink-navy underline decoration-signal-amber decoration-2 underline-offset-2 hover:text-signal-amber"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/organizer/dashboard"
        className="flex items-center gap-1.5 rounded text-sm text-slate transition-colors duration-150 ease-out hover:text-ink-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back to dashboard
      </Link>

      {loading || !event ? (
        <div className="mt-6">
          <DetailSkeleton />
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold text-ink-navy">Event details</h1>
            <StatusBadge status={event.status} />
          </div>

          <div className="mt-6">
            <EventPlanSummary event={event} plan={plan} />
          </div>

          <div className="mt-8">
            {event.status === "planning" ? (
              <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-slate/25 bg-white px-6 py-10 text-center">
                <p className="font-body text-sm text-slate">
                  This plan hasn't been published yet — vendors can't bid on it until you do.
                </p>
                <Button variant="primary" size="md" onClick={handlePublish} disabled={publishing}>
                  {publishing && <Loader2 size={16} className="animate-spin" />}
                  <Send size={16} strokeWidth={2} />
                  {publishing ? "Publishing…" : "Publish for Bidding"}
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-ink-navy">
                  Vendor bids{bids.length > 0 ? ` (${bids.length})` : ""}
                </h2>

                {acceptError && (
                  <p className="mt-3 rounded border border-alert-red/30 bg-alert-red/10 px-3 py-2 text-sm text-alert-red">
                    {acceptError}
                  </p>
                )}

                <div className="mt-4 overflow-hidden rounded-md border border-slate/15 bg-white">
                  {bids.length === 0 ? (
                    <p className="p-8 text-center font-body text-sm text-slate">
                      Awaiting first bid — matched vendors have been notified.
                    </p>
                  ) : (
                    bids.map((bid) => (
                      <BidCard
                        key={bid.id}
                        bid={bid}
                        canAccept={event.status === "bidding_open"}
                        accepting={acceptingId === bid.id}
                        onAccept={handleAccept}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default EventDetail
