import { useEffect, useState } from "react"
import { Radar, Plus, Package } from "lucide-react"
import OpportunityCard from "../../components/OpportunityCard"
import BidStatusBadge from "../../components/BidStatusBadge"
import BidSubmissionModal from "../../components/BidSubmissionModal"
import FormField from "../../components/FormField"
import Button from "../../components/Button"
import { listVendorOpportunities, listVendorBids, addInstantRental } from "../../services/api"
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
  const vendor = { ...currentVendor, ...user, rating: user?.rating ?? currentVendor.rating }

  const [opportunities, setOpportunities] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeCategories, setActiveCategories] = useState([])

  // Instant rental listing form states
  const [eqSummary, setEqSummary] = useState("")
  const [price, setPrice] = useState("")
  const [cat, setCat] = useState("Audio")
  const [listingSuccess, setListingSuccess] = useState("")
  const [localListings, setLocalListings] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([
      listVendorOpportunities(vendor.equipmentCategory, vendor.region),
      listVendorBids(vendor.name),
    ]).then(([opps, bids]) => {
      if (!active) return
      setOpportunities(opps)
      setMyBids(bids)
      setLoading(false)
    })

    // Load vendor's own local instant rentals
    try {
      const allLocal = JSON.parse(localStorage.getItem("soundscout.local_rentals") || "[]")
      const vendorLocal = allLocal.filter((l) => l.vendorName === vendor.name)
      setLocalListings(vendorLocal)
    } catch (_) {}

    return () => {
      active = false
    }
  }, [vendor.name, vendor.equipmentCategory])

  const biddedEventIds = new Set(myBids.map((bid) => bid.eventId))

  function handleBidSubmitted(bid) {
    setMyBids((prev) => [...prev, bid])
    setActiveEvent(null)
  }

  async function handleAddRental(e) {
    e.preventDefault()
    if (!eqSummary.trim() || !price) return
    try {
      const listing = {
        vendorName: vendor.name,
        category: cat,
        equipmentSummary: eqSummary,
        location: vendor.region || "Colombo",
        pricePerDay: Number(price),
      }
      const added = await addInstantRental(listing)
      setLocalListings((prev) => [...prev, added])
      setEqSummary("")
      setPrice("")
      setListingSuccess("Rental listing added successfully!")
      setTimeout(() => setListingSuccess(""), 4000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Opportunities and Bids */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-circuit-teal">
              {vendor.equipmentCategory}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink-navy sm:text-3xl">
              Open opportunities
            </h1>
            <p className="mt-1 font-body text-sm text-slate">
              Events matching your category and district, generated straight from the organizer's AI plan.
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
                  Check back soon — new plans matching {vendor.equipmentCategory} inside {vendor.region || "your area"} show up here
                  as soon as organizers publish them.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {opportunities.map((event) => (
                  <OpportunityCard
                    key={event.id}
                    event={event}
                    vendor={vendor}
                    hasBid={biddedEventIds.has(event.id)}
                    onPlaceBid={(ev, cats) => {
                      setActiveEvent(ev)
                      setActiveCategories(cats)
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
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
        </div>

        {/* Right Column: Manage Rental Inventory */}
        <div className="space-y-8">
          <div className="rounded-md border border-slate/15 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-ink-navy flex items-center gap-2">
              <Plus size={20} className="text-signal-amber" />
              List for Instant Rental
            </h2>
            <p className="mt-1 font-body text-xs text-slate">
              List individual gear or equipment package for organizers to instantly book.
            </p>

            <form onSubmit={handleAddRental} className="mt-5 space-y-4">
              {listingSuccess && (
                <p className="font-mono text-xs text-circuit-teal bg-circuit-teal/10 rounded px-2.5 py-1.5">
                  {listingSuccess}
                </p>
              )}

              <FormField
                label="Gear / Package Details"
                name="eqSummary"
                value={eqSummary}
                onChange={(e) => setEqSummary(e.target.value)}
                placeholder="e.g. 2x JBL active speakers & stands"
              />

              <FormField
                label="Price per Day (LKR)"
                name="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 15000"
              />

              <FormField
                as="select"
                label="Category"
                name="cat"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Staging">Staging</option>
                <option value="Visuals">Visuals</option>
                <option value="Power">Power</option>
              </FormField>

              <Button type="submit" variant="secondary" size="md" className="w-full">
                Add Listing
              </Button>
            </form>
          </div>

          <div className="rounded-md border border-slate/15 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-ink-navy flex items-center gap-2">
              <Package size={20} className="text-circuit-teal" />
              My Rental Items
            </h2>

            <div className="mt-4 space-y-3">
              {localListings.length === 0 ? (
                <p className="text-xs text-slate font-body text-center py-4">
                  No instant rentals listed yet.
                </p>
              ) : (
                localListings.map((listing) => (
                  <div key={listing.id} className="rounded border border-slate/10 p-3 bg-slate/5">
                    <p className="font-display text-xs font-semibold text-ink-navy">
                      {listing.equipmentSummary}
                    </p>
                    <div className="mt-1 flex justify-between font-mono text-[10px] text-slate">
                      <span>{listing.category}</span>
                      <span className="font-semibold text-circuit-teal">{formatLKR(listing.pricePerDay)}/day</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {activeEvent && (
        <BidSubmissionModal
          event={activeEvent}
          initialCategories={activeCategories}
          vendor={vendor}
          onClose={() => {
            setActiveEvent(null)
            setActiveCategories([])
          }}
          onSubmitted={handleBidSubmitted}
        />
      )}
    </div>
  )
}

export default VendorDashboard
