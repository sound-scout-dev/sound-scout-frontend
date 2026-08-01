import { MapPin, Star, CheckCircle2 } from "lucide-react"
import Button from "./Button"

const AVAILABILITY_LABEL = {
  now: "Available now",
  "2h": "Available in 2 hrs",
  "4h": "Available in 4 hrs",
}

function RentalListingCard({ listing, booked, onBook }) {
  const isNow = listing.availability === "now"

  return (
    <div className="flex flex-col rounded-xl bg-glass p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-gray-900">
            {listing.vendorName}
          </h3>
          <span className="mt-1 inline-block rounded border border-[#059669]/30 bg-[#059669]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#059669]">
            {listing.category}
          </span>
        </div>
        <span
          className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${
            isNow
              ? "border-[#059669]/30 bg-[#059669]/10 text-[#059669]"
              : "border-gray-200 bg-gray-50 text-gray-500"
          }`}
        >
          {AVAILABILITY_LABEL[listing.availability]}
        </span>
      </div>

      <p className="mt-3 font-body text-sm text-gray-600">{listing.equipmentSummary}</p>

      {(listing.photoUrl || (Array.isArray(listing.photos) && listing.photos[0])) && (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate/15 max-h-48 bg-slate/5">
          <img 
            src={listing.photoUrl || listing.photos[0]} 
            alt={listing.equipmentSummary} 
            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-xs text-slate">
        <span className="flex items-center gap-1.5">
          <MapPin size={13} strokeWidth={2} />
          {listing.location} · {listing.distanceKm} km
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={13} className="fill-signal-amber text-signal-amber" />
          {listing.rating.toFixed(1)} / 5
        </span>
        {listing.qty !== undefined && (
          <span className="text-[#059669] font-bold font-mono">
            {listing.qty} left
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="font-mono text-lg font-semibold text-gray-900">
          Rs. {listing.pricePerDay}
          <span className="text-sm font-normal text-gray-500">/day</span>
        </span>

        {booked || listing.status === "booked" || listing.availability === "booked" || (listing.qty !== undefined && Number(listing.qty) <= 0) ? (
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wide text-[#059669]">
            <CheckCircle2 size={15} strokeWidth={2} />
            Booked
          </span>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => onBook(listing)}>
            Book Now
          </Button>
        )}
      </div>
    </div>
  )
}

export default RentalListingCard
