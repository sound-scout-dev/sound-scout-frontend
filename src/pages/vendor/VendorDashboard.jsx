import { useEffect, useState } from "react"
import { Radar, Plus, Package, CheckCircle2 } from "lucide-react"
import OpportunityCard from "../../components/OpportunityCard"
import BidStatusBadge from "../../components/BidStatusBadge"
import BidSubmissionModal from "../../components/BidSubmissionModal"
import FormField from "../../components/FormField"
import Button from "../../components/Button"
import { listVendorOpportunities, listVendorBids, addInstantRental, subscribePremium } from "../../services/api"
import { currentVendor } from "../../services/mockData"
import { useAuth } from "../../context/AuthContext"
import { Award, Loader2 } from "lucide-react"
import FullPageLoader from "../../components/FullPageLoader"

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

function sanitizeWhatsAppPhone(phone) {
  if (!phone) return ""
  let clean = phone.replace(/[^0-9]/g, "")
  if (clean.startsWith("0")) {
    clean = "94" + clean.slice(1)
  }
  return clean
}

function VendorDashboard() {
  const { user } = useAuth()
  const vendor = { ...currentVendor, ...user, rating: user?.rating ?? currentVendor.rating }

  const [opportunities, setOpportunities] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [isPremium, setIsPremium] = useState(user?.is_premium || false)

  const handleUpgradePremium = () => {
    setSubscribing(true)
    subscribePremium().then((res) => {
      setIsPremium(true)
      setSubscribing(false)
    }).catch(() => setSubscribing(false))
  }
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeCategories, setActiveCategories] = useState([])
  // Derive biddedEventIds dynamically
  const biddedEventIds = new Set(myBids.map((bid) => bid.eventId))

  // Instant rental listing form states
  const [eqSummary, setEqSummary] = useState("")
  const [price, setPrice] = useState("")
  const [qty, setQty] = useState("1")
  const [cat, setCat] = useState("Audio")
  const [photoUrl, setPhotoUrl] = useState("")
  const [listingSuccess, setListingSuccess] = useState("")
  const [localListings, setLocalListings] = useState([])

  useEffect(() => {
    let active = true
    setLoading(true)
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
  }, [user])

  if (loading) {
    return <FullPageLoader message="SYNCING OPPORTUNITIES..." />
  }

  function handleBidSubmitted(bid) {
    setMyBids((prev) => [...prev, bid])
    setActiveEvent(null)
  }

  async function handleAddRental(e) {
    e.preventDefault()
    if (!eqSummary.trim() || !price) return
    try {
      const listing = {
        vendor_id: user?.id,
        vendorName: vendor.name,
        category: cat,
        equipmentSummary: eqSummary,
        location: vendor.region || "Colombo",
        pricePerDay: Number(price),
        qty: Number(qty) || 1,
        photoUrl: photoUrl.trim() || null
      }
      const added = await addInstantRental(listing)
      setLocalListings((prev) => [...prev, added])
      setEqSummary("")
      setPrice("")
      setQty("1")
      setPhotoUrl("")
      setListingSuccess("Rental listing added successfully!")
      setTimeout(() => setListingSuccess(""), 4000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in-up">
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
                    <div className="sm:justify-self-end flex items-center gap-3">
                      <BidStatusBadge status={bid.status} />
                      {bid.status === "accepted" && bid.organizerPhone && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=${sanitizeWhatsAppPhone(bid.organizerPhone)}&text=${encodeURIComponent(
                            `Hi ${bid.organizerName}, I'm the vendor for your event "${bid.eventName}". My bid of Rs. ${bid.price.toLocaleString()} was accepted. Looking forward to coordinating!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded bg-[#25D366] px-2.5 py-1.5 font-sans text-xs font-semibold text-white hover:bg-[#20ba5a] transition-all hover:scale-105 duration-150 ease-out"
                          title="Chat with Organizer"
                        >
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.835-4.577c1.611.956 3.197 1.48 4.793 1.48 5.517 0 10.005-4.486 10.008-10.004.002-2.673-1.031-5.187-2.908-7.065C16.858 2.055 14.348.99 11.693.99c-5.522 0-10.01 4.486-10.013 10.006-.001 1.77.462 3.5 1.34 5.018l-1.011 3.686 3.784-.992zm11.233-7.25c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.569-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          </svg>
                          Chat
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Manage Rental Inventory */}
        <div className="space-y-8">
          {/* SoundScout Premium Subscription Card */}
          <div className="rounded-xl border border-[#0891B2]/30 bg-glass p-6 shadow-md space-y-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <Award className="text-[#0891B2]" size={24} />
              <h2 className="font-display text-base font-semibold text-gray-900">
                SoundScout Premium
              </h2>
            </div>
            
            {isPremium ? (
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#059669]/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#059669] border border-[#059669]/35">
                  ✓ Verified Premium Active
                </span>
                <p className="font-body text-xs text-gray-650 leading-relaxed">
                  Your profile is verified. Your bids are now boosted to the top of organizer matching lists!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-body text-xs text-gray-650 leading-relaxed">
                  Upgrade to get a gold **Verified Premium** checkmark next to your bids and rank at the **very top** of matching searches!
                </p>
                <div className="flex items-center justify-between font-mono text-xs text-gray-700 font-bold bg-white/45 backdrop-blur-sm p-2.5 rounded-lg border border-gray-200/40 shadow-sm">
                  <span>Subscription Cost</span>
                  <span className="text-[#0891B2]">Rs. 4,900 / mo</span>
                </div>
                <button
                  onClick={handleUpgradePremium}
                  disabled={subscribing}
                  className="w-full rounded-lg bg-[#059669] py-2.5 font-sans text-xs font-semibold text-white hover:bg-[#047857] shadow-sm transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {subscribing ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    "Upgrade to Premium"
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-glass p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up">
            <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus size={20} className="text-[#0891B2]" />
              List for Instant Rental
            </h2>
            <p className="mt-1 font-body text-xs text-gray-500">
              List individual gear or equipment package for organizers to instantly book.
            </p>

            <form onSubmit={handleAddRental} className="mt-5 space-y-4">
              {listingSuccess && (
                <p className="font-mono text-xs text-[#059669] bg-[#059669]/10 rounded px-2.5 py-1.5">
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
                label="Quantity Available"
                name="qty"
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="e.g. 1"
              />

              <FormField
                label="Equipment Photo / Image URL"
                name="photoUrl"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/photo-..."
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

          <div className="rounded-xl bg-glass p-6 shadow-sm space-y-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up">
            <div>
              <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200/50 pb-2">
                <Package size={20} className="text-[#059669]" />
                Active Inventory Listings
              </h2>

              <div className="mt-3 space-y-3">
                {localListings.filter(l => l.status !== "booked" && (l.qty === undefined || l.qty > 0)).length === 0 ? (
                  <p className="text-xs text-slate font-body text-center py-4 italic">
                    No active inventory items listed.
                  </p>
                ) : (
                  localListings.filter(l => l.status !== "booked" && (l.qty === undefined || l.qty > 0)).map((listing) => (
                    <div key={listing.id} className="rounded-lg border border-gray-200/40 p-3 bg-white/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-[1.01] hover:border-[#0891B2]/30">
                      <p className="font-display text-xs font-semibold text-gray-900">
                        {listing.equipmentSummary}
                      </p>
                      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-gray-500">
                        <span>{listing.category} · Qty: {listing.qty ?? 1}</span>
                        <span className="font-semibold text-[#0891B2]">{formatLKR(listing.pricePerDay)}/day</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-ink-navy flex items-center gap-2 border-b border-slate/10 pb-2">
                <CheckCircle2 size={20} className="text-circuit-teal" />
                Confirmed Bookings
              </h2>

              <div className="mt-3 space-y-3">
                {localListings.filter(l => l.status === "booked" || (l.qty !== undefined && l.qty <= 0)).length === 0 ? (
                  <p className="text-xs text-slate font-body text-center py-4 italic">
                    No confirmed bookings yet.
                  </p>
                ) : (
                  localListings.filter(l => l.status === "booked" || (l.qty !== undefined && l.qty <= 0)).map((listing) => (
                    <div key={listing.id} className="rounded border border-alert-red/20 p-3 bg-alert-red/5">
                      <p className="font-display text-xs font-semibold text-ink-navy">
                        {listing.equipmentSummary}
                      </p>
                      <div className="mt-1 flex justify-between font-mono text-[10px] text-slate">
                        <span className="text-alert-red font-semibold uppercase tracking-wider text-[9px] bg-alert-red/10 px-1 rounded">Booked / Reserved</span>
                        <span className="font-semibold text-slate">{formatLKR(listing.pricePerDay)}/day</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
