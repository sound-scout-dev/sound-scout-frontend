import { useEffect, useState } from "react"
import { useParams, useLocation, Link } from "react-router-dom"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import StatusBadge from "../../components/StatusBadge"
import EventPlanSummary from "../../components/EventPlanSummary"
import BidCard from "../../components/BidCard"
import Button from "../../components/Button"
import StepResults from "../../components/new-event/StepResults"
import { getEventById, listBidsForEvent, publishEvent, acceptAndPayBid, releaseFinalPayment, submitReview } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import AcceptBidModal from "../../components/AcceptBidModal"
import ReviewVendorModal from "../../components/ReviewVendorModal"

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

  const [selectedBid, setSelectedBid] = useState(null)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All")

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [releasingTxn, setReleasingTxn] = useState(false)

  const acceptedBid = bids.find((b) => b.status === "accepted")
  const planCategories = plan?.categories?.map((c) => c.name) || []

  const filteredBids = bids.filter((b) => {
    if (selectedCategoryFilter === "All") return true
    return b.bid_categories && b.bid_categories.includes(selectedCategoryFilter)
  })

  const handleReleasePayout = () => {
    if (!acceptedBid) return
    setReleasingTxn(true)
    setTimeout(() => {
      const mockTxn = "TXN_PAYOUT_" + Math.random().toString(36).substr(2, 9).toUpperCase()
      releaseFinalPayment(acceptedBid.id, mockTxn).then(() => {
        setBids((prev) =>
          prev.map((b) => ({
            ...b,
            finalPaymentStatus: b.id === acceptedBid.id ? "paid" : b.finalPaymentStatus,
          }))
        )
        setReleasingTxn(false)
        setShowReviewModal(true)
      })
    }, 2000)
  }

  const handleSubmitReview = (rating, comment) => {
    if (!acceptedBid) return Promise.resolve()
    return submitReview({
      eventId: event.id,
      vendorId: acceptedBid.vendorId,
      rating,
      comment,
    }).then(() => {
      // Re-fetch bids to update rating averages
      listBidsForEvent(id).then(fetchedBids => {
        if (fetchedBids) setBids(fetchedBids)
      })
    })
  }

  function handlePublish() {
    setPublishing(true)
    publishEvent(event.id, plan).then(() => {
      setEvent((e) => ({ ...e, status: "bidding_open" }))
      setPublishing(false)
    })
  }

  function handleAccept(bidId) {
    const targetBid = bids.find((b) => b.id === bidId)
    setSelectedBid(targetBid)
  }

  function handlePaymentSuccess(transactionId) {
    if (!selectedBid) return
    setAcceptingId(selectedBid.id)
    acceptAndPayBid(selectedBid.id, transactionId).then(() => {
      setBids((prev) =>
        prev.map((b) => ({
          ...b,
          status: b.id === selectedBid.id ? "accepted" : "declined",
          payment_status: b.id === selectedBid.id ? "paid" : b.payment_status,
        }))
      )
      setEvent((e) => ({ ...e, status: "booked" }))
      setAcceptingId(null)
      
      // Re-fetch bids to pull the newly unlocked vendorPhone value from the gated backend query!
      listBidsForEvent(id).then(fetchedBids => {
        if (fetchedBids) setBids(fetchedBids)
      })
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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in-up">
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

          {event.status === "planning" ? (
            <div className="mt-8">
              <StepResults
                plan={plan}
                onPlanChange={setPlan}
                onPublish={handlePublish}
                publishing={publishing}
              />
            </div>
          ) : (
            <>
              {acceptedBid && (
                <div className="mt-6 rounded-md border border-slate/15 bg-white p-5 space-y-4 shadow-sm">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-navy flex items-center justify-between">
                    <span>Escrow Payment Ledger</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate bg-slate/5 px-2 py-0.5 rounded border border-slate/10">
                      Split Payout Structure (50/50)
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-body text-slate border-t border-slate/5 pt-3">
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-widest text-slate/60">Deposit (50% Quote + 6% Fee)</span>
                      <span className="font-semibold text-ink-navy flex items-center gap-1.5 mt-0.5">
                        <span className="h-2 w-2 rounded-full bg-circuit-teal" />
                        {acceptedBid.paymentStatus === 'paid' ? 'Paid & Verified' : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-widest text-slate/60">Final Release (50% Quote)</span>
                      <span className="font-semibold text-ink-navy flex items-center gap-1.5 mt-0.5">
                        <span className={`h-2 w-2 rounded-full ${acceptedBid.finalPaymentStatus === 'paid' ? 'bg-[#25D366]' : 'bg-signal-amber animate-pulse'}`} />
                        {acceptedBid.finalPaymentStatus === 'paid' ? 'Released to Vendor' : 'Held in Escrow'}
                      </span>
                    </div>
                  </div>
                  
                  {acceptedBid.paymentStatus === 'paid' && acceptedBid.finalPaymentStatus === 'unpaid' && (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const eventDateObj = new Date(event.date);
                    eventDateObj.setHours(0, 0, 0, 0);
                    const isEventDayOrLater = today >= eventDateObj;

                    if (isEventDayOrLater) {
                      return (
                        <div className="border-t border-slate/10 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-circuit-teal/5 -mx-5 -mb-5 p-5 mt-2 rounded-b-md w-[calc(100%+2.5rem)]">
                          <div className="text-xs text-slate max-w-sm">
                            💡 **Post-Event Final Release:** Release the remaining 50% payout of **Rs. {(acceptedBid.price * 0.5).toLocaleString()}** to complete the contract.
                          </div>
                          <button
                            onClick={handleReleasePayout}
                            disabled={releasingTxn}
                            className="rounded bg-circuit-teal px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-circuit-teal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto shadow-sm"
                          >
                            {releasingTxn ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                Releasing Payout...
                              </>
                            ) : (
                              "Release 50% Payout"
                            )}
                          </button>
                        </div>
                      )
                    } else {
                      return (
                        <div className="border-t border-slate/10 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate/5 -mx-5 -mb-5 p-5 mt-2 rounded-b-md w-[calc(100%+2.5rem)]">
                          <div className="text-xs text-slate max-w-sm flex items-center gap-1.5">
                            <span>🔒</span>
                            <span>
                              **Escrow Locked:** The remaining 50% payout of **Rs. {(acceptedBid.price * 0.5).toLocaleString()}** will unlock on the event date: **{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}**.
                            </span>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </div>
              )}

              <div className="mt-6">
                <EventPlanSummary event={event} plan={plan} />
              </div>

              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="font-display text-lg font-semibold text-ink-navy">
                    Vendor bids{bids.length > 0 ? ` (${bids.length})` : ""}
                  </h2>

                  {/* Category Filter Options */}
                  {bids.length > 0 && planCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedCategoryFilter("All")}
                        className={`rounded px-2.5 py-1 text-[10px] font-mono border uppercase tracking-wider transition-all duration-150 ${
                          selectedCategoryFilter === "All"
                            ? "border-circuit-teal bg-circuit-teal/10 text-circuit-teal font-bold shadow-sm"
                            : "border-slate/15 bg-transparent text-slate hover:bg-slate/5"
                        }`}
                      >
                        All Categories
                      </button>
                      {planCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategoryFilter(cat)}
                          className={`rounded px-2.5 py-1 text-[10px] font-mono border uppercase tracking-wider transition-all duration-150 ${
                            selectedCategoryFilter === cat
                              ? "border-circuit-teal bg-circuit-teal/10 text-circuit-teal font-bold shadow-sm"
                              : "border-slate/15 bg-transparent text-slate hover:bg-slate/5"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 overflow-hidden rounded-md border border-slate/15 bg-white">
                  {filteredBids.length === 0 ? (
                    <p className="p-8 text-center font-body text-sm text-slate">
                      No bids matching category "{selectedCategoryFilter}" — check back soon.
                    </p>
                  ) : bids.length === 0 ? (
                    <p className="p-8 text-center font-body text-sm text-slate">
                      Awaiting first bid — matched vendors have been notified.
                    </p>
                  ) : (
                    filteredBids.map((bid) => (
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
              </div>
            </>
          )}
        </>
      )}
      <AcceptBidModal
        isOpen={!!selectedBid}
        onClose={() => setSelectedBid(null)}
        bid={selectedBid}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <ReviewVendorModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        bid={acceptedBid}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  )
}

export default EventDetail
