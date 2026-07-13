import { useEffect, useState } from "react"
import { Radar } from "lucide-react"
import OpportunityCard from "../../components/OpportunityCard"
import BidStatusBadge from "../../components/BidStatusBadge"
import BidSubmissionModal from "../../components/BidSubmissionModal"
import { listVendorOpportunities, listVendorBids } from "../../services/api"
import { currentVendor } from "../../services/mockData"
import { useAuth } from "../../context/AuthContext"

function formatLKR(n) {
  return "Rs. " + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })
}

function Skeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-md border border-slate/15 bg-white p-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate/10" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate/10" />
          <div className="mt-6 h-10 w-full animate-pulse rounded bg-slate/10" />
        </div>
      ))}
    </div>
  )
}

function VendorDashboard() {
  const { user } = useAuth()
  // Falls back to the demo fixture if no one has registered/logged in this
  // session yet (e.g. navigating straight to this URL), and fills in a rating
  // since the backend's User schema has no such field.
  const vendor = { ...currentVendor, ...user, rating: user?.rating ?? currentVendor.rating }

  const [opportunities, setOpportunities] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEvent, setActiveEvent] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      listVendorOpportunities(vendor.equipmentCategory),
      listVendorBids(vendor.name),
    ]).then(([opps, bids]) => {
      if (!active) return
      setOpportunities(opps)
      setMyBids(bids)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const biddedEventIds = new Set(myBids.map((bid) => bid.eventId))

  function handleBidSubmitted(bid) {
    setMyBids((prev) => [...prev, bid])
    setActiveEvent(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-circuit-teal">
          {vendor.equipmentCategory}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-navy sm:text-3xl">
          Open opportunities
        </h1>
        <p className="mt-1 font-body text-sm text-slate">
          Events matching your category, generated straight from the organizer's AI plan.
        </p>
      </div>

      <div className="mt-6">
        {loading ? (
          <Skeleton />
        ) : opportunities.length === 0 ? (
          <div className="flex flex-col items-center rounded-md border border-dashed border-slate/25 bg-white px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-circuit-teal/10 text-circuit-teal">
              <Radar size={22} strokeWidth={2} />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink-navy">
              No open opportunities right now
            </h2>
            <p className="mt-1.5 max-w-sm font-body text-sm text-slate">
              Check back soon — new plans matching {vendor.equipmentCategory} show up here
              as soon as organizers publish them.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {opportunities.map((event) => (
              <OpportunityCard
                key={event.id}
                event={event}
                hasBid={biddedEventIds.has(event.id)}
                onPlaceBid={setActiveEvent}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-display text-xl font-semibold text-ink-navy">My bids</h2>

        <div className="mt-4 overflow-hidden rounded-md border border-slate/15 bg-white">
          {loading ? (
            <div className="p-5">
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate/10" />
            </div>
          ) : myBids.length === 0 ? (
            <p className="p-8 text-center font-body text-sm text-slate">
              You haven't placed any bids yet.
            </p>
          ) : (
            myBids.map((bid) => (
              <div
                key={bid.id}
                className="grid grid-cols-1 gap-3 border-b border-slate/10 p-5 last:border-b-0 sm:grid-cols-[1.5fr_1fr_auto] sm:items-center"
              >
                <p className="font-display text-sm font-semibold text-ink-navy">{bid.eventName}</p>
                <p className="font-mono text-sm text-ink-navy">{formatLKR(bid.price)}</p>
                <div className="sm:justify-self-end">
                  <BidStatusBadge status={bid.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeEvent && (
        <BidSubmissionModal
          event={activeEvent}
          vendor={vendor}
          onClose={() => setActiveEvent(null)}
          onSubmitted={handleBidSubmitted}
        />
      )}
    </div>
  )
}

export default VendorDashboard
