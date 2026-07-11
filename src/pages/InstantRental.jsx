import { useEffect, useState } from "react"
import { Zap, Search, PackageSearch } from "lucide-react"
import RentalListingCard from "../components/RentalListingCard"
import BookingConfirmModal from "../components/BookingConfirmModal"
import { searchInstantRentals } from "../services/api"
import { RENTAL_CATEGORIES } from "../services/mockData"

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
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookedIds, setBookedIds] = useState(new Set())
  const [activeListing, setActiveListing] = useState(null)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      searchInstantRentals({ category, location }).then((data) => {
        setResults(data)
        setLoading(false)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [category, location])

  function handleBooked(listingId) {
    setBookedIds((prev) => new Set(prev).add(listingId))
    setActiveListing(null)
  }

  return (
    <>
      <section className="border-b-2 border-alert-red/30 bg-ink-navy">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded border border-alert-red/40 bg-alert-red/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-alert-red">
            <Zap size={14} strokeWidth={2.5} />
            Instant Rental Mode
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-paper sm:text-4xl">
            Need gear right now?
          </h1>
          <p className="mt-3 max-w-xl font-body text-paper/60">
            Skip the AI plan — search live vendor availability near you and book in one tap.
            Built for last-minute, day-of, or emergency replacement gear.
          </p>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 rounded-md border border-slate/15 bg-white p-4 sm:flex-row sm:items-center">
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
                placeholder="Search by location, e.g. Austin"
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
                    onBook={setActiveListing}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {activeListing && (
        <BookingConfirmModal
          listing={activeListing}
          onClose={() => setActiveListing(null)}
          onBooked={handleBooked}
        />
      )}
    </>
  )
}

export default InstantRental
