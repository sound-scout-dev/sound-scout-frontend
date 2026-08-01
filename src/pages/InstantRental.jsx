import { useEffect, useState } from "react"
import { Zap, Search, PackageSearch, UserPlus, LogIn, X } from "lucide-react"
import { Link } from "react-router-dom"
import RentalListingCard from "../components/RentalListingCard"
import BookingConfirmModal from "../components/BookingConfirmModal"
import Modal from "../components/Modal"
import Button from "../components/Button"
import { searchInstantRentals } from "../services/api"
import { RENTAL_CATEGORIES } from "../services/mockData"
import FullPageLoader from "../components/FullPageLoader"
import { useAuth } from "../context/AuthContext"

const inputClass =
  "rounded border border-slate/25 bg-white px-3 py-2.5 text-sm text-ink-navy transition-colors duration-150 ease-out hover:border-slate/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber"

function Skeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-md border border-slate/15 bg-white p-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate/10" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate/10" />
          <div className="mt-6 h-10 w-full animate-pulse rounded bg-slate/10" />
        </div>
      ))}
    </div>
  )
}

function InstantRental() {
  const { user } = useAuth()
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookedIds, setBookedIds] = useState(new Set())
  const [activeListing, setActiveListing] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Initial and filtered search fetch
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      searchInstantRentals({ category, location }).then((data) => {
        setResults(data)
        setLoading(false)
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [category, location])

  // Real-time Web Socket / SSE Inventory Stream Listener
  useEffect(() => {
    let eventSource;
    try {
      const backendUrl = "https://sound-scout-backend.onrender.com"
      eventSource = new EventSource(`${backendUrl}/api/rentals/stream`)

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'QUANTITY_UPDATED') {
            setResults((prev) =>
              prev.map((item) =>
                item.id === data.itemId
                  ? { ...item, qty: data.newQty, availability: data.newQty <= 0 ? 'booked' : 'now' }
                  : item
              )
            )
          } else if (data.type === 'ITEM_ADDED' && data.item) {
            setResults((prev) => [data.item, ...prev])
          }
        } catch (err) {
          console.warn("SSE parse error:", err)
        }
      }
    } catch (err) {
      console.warn("SSE connection error:", err)
    }

    return () => {
      eventSource?.close()
    }
  }, [])

  if (initialLoading) {
    return <FullPageLoader message="SYNCING INSTANT RENTAL INVENTORY..." />
  }

  function handleAttemptBook(listing) {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setActiveListing(listing)
  }

  function handleBooked(listingId) {
    setBookedIds((prev) => new Set(prev).add(listingId))
    setActiveListing(null)
  }

  return (
    <div className="animate-fade-in-up">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-lg border border-[#0891B2]/30 bg-[#0891B2]/5 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-[#0891B2] font-bold">
            <Zap size={14} strokeWidth={2.5} />
            Instant Rental Mode
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-gray-900 sm:text-4xl">
            Need gear right now?
          </h1>
          <p className="mt-3 max-w-xl font-body text-gray-600 leading-relaxed">
            Skip the AI plan — search live vendor availability near you and book in one tap.
            Built for last-minute, day-of, or emergency replacement gear.
          </p>
        </div>
      </section>

      <section className="bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 rounded-xl bg-glass p-4 sm:flex-row sm:items-center shadow-sm">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Equipment category"
              className={`${inputClass} sm:w-56`}
            >
              <option value="">All categories</option>
              {RENTAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate/40" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search by location, e.g. Colombo"
                aria-label="Location"
                className={`${inputClass} w-full pl-9`}
              />
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <Skeleton />
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center rounded-md border border-dashed border-slate/25 bg-white px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-alert-red/10 text-alert-red">
                  <PackageSearch size={22} strokeWidth={2} />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink-navy">
                  No matches nearby
                </h2>
                <p className="mt-1.5 max-w-sm font-body text-sm text-slate">
                  Try a different category or a broader location search.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((listing) => (
                  <RentalListingCard
                    key={listing.id}
                    listing={listing}
                    booked={bookedIds.has(listing.id)}
                    onBook={handleAttemptBook}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Auth Required Modal */}
      {showAuthModal && (
        <Modal title="Registration Required" onClose={() => setShowAuthModal(false)}>
          <div className="text-center py-4 space-y-4">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-circuit-teal/10 text-circuit-teal">
              <UserPlus size={28} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-ink-navy">Create an account to book gear</h3>
              <p className="mt-1 font-body text-xs text-slate max-w-xs mx-auto">
                You must be registered and logged into SoundScout to place instant rental bookings and access Escrow protection.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-2.5">
              <Link to="/register">
                <Button type="button" variant="primary" size="md" className="w-full flex items-center justify-center gap-2">
                  <UserPlus size={16} /> Register New Account
                </Button>
              </Link>
              <Link to="/login">
                <Button type="button" variant="outline-dark" size="md" className="w-full flex items-center justify-center gap-2">
                  <LogIn size={16} /> Already have an account? Log In
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Booking Confirmation Modal */}
      {activeListing && (
        <BookingConfirmModal
          listing={activeListing}
          onClose={() => setActiveListing(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  )
}

export default InstantRental
