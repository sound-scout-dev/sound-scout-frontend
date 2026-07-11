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
    <div className="flex flex-col rounded-md border border-slate/15 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-navy">
            {listing.vendorName}
          </h3>
          <span className="mt-1 inline-block rounded border border-circuit-teal/30 bg-circuit-teal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-circuit-teal">
            {listing.category}
          </span>
        </div>
        <span
          className={`shrink-0 rounded border px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${
            isNow
              ? "border-circuit-teal/40 bg-circuit-teal/10 text-circuit-teal"
              : "border-slate/20 bg-slate/10 text-slate"
          }`}
        >
          {AVAILABILITY_LABEL[listing.availability]}
        </span>
      </div>

      <p className="mt-3 font-body text-sm text-slate">{listing.equipmentSummary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-xs text-slate">
        <span className="flex items-center gap-1.5">
          <MapPin size={13} strokeWidth={2} />
          {listing.location} · {listing.distanceKm} km
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={13} className="fill-signal-amber text-signal-amber" />
          {listing.rating.toFixed(1)} / 5
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="font-mono text-lg font-semibold text-ink-navy">
          ${listing.pricePerDay}
          <span className="text-sm font-normal text-slate">/day</span>
        </span>

        {booked ? (
          <span className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-circuit-teal">
            <CheckCircle2 size={15} strokeWidth={2} />
            Booked
          </span>
        ) : (
          <Button variant="danger" size="sm" onClick={() => onBook(listing)}>
            Book Now
          </Button>
        )}
      </div>
    </div>
  )
}

export default RentalListingCard
