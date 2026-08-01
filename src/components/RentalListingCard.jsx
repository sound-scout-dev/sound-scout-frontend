import { MapPin, Star, CheckCircle2, MessageSquare } from "lucide-react"
import Button from "./Button"

const AVAILABILITY_LABEL = {
  now: "AVAILABLE NOW",
  booked: "BOOKED",
  maintenance: "MAINTENANCE",
}

function normPhone(phone) {
  let n = String(phone || '').replace(/\D/g, '')
  if (n.startsWith('0')) n = '94' + n.substring(1)
  else if (n.length === 9 && n.startsWith('7')) n = '94' + n
  return n
}

function RentalListingCard({ listing, booked, onBook }) {
  const displayPhoto = listing.photoUrl || listing.photo_url || (Array.isArray(listing.photos) && listing.photos[0]) || null
  const rawPhone = listing.vendorPhone || listing.vendor_phone || listing.phone || ""
  const cleanPhone = normPhone(rawPhone)

  return (
    <div className="flex flex-col rounded-xl bg-glass p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-gray-900">
            {listing.vendorName || listing.vendor_name || "Verified Vendor"}
          </h3>
          <span className="mt-1 inline-block rounded border border-[#059669]/30 bg-[#059669]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#059669]">
            {listing.category}
          </span>
        </div>
        <span
          className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${
            listing.availability === "booked" || (listing.qty !== undefined && Number(listing.qty) <= 0)
              ? "bg-slate/10 text-slate border-slate/20"
              : "border-[#059669]/30 bg-[#059669]/10 text-[#059669]"
          }`}
        >
          {AVAILABILITY_LABEL[listing.availability] || listing.availability || "Available now"}
        </span>
      </div>

      <p className="mt-3 font-body text-sm text-gray-600">{listing.equipmentSummary}</p>

      {displayPhoto && (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate/15 max-h-48 bg-slate/5">
          <img 
            src={displayPhoto} 
            alt={listing.equipmentSummary} 
            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-xs text-slate">
        <span className="flex items-center gap-1.5">
          <MapPin size={13} strokeWidth={2} />
          {listing.location || "Colombo"}
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={13} className="fill-signal-amber text-signal-amber" />
          {(Number(listing.rating) || 5.0).toFixed(1)} / 5
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
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wide text-[#059669]">
              <CheckCircle2 size={15} strokeWidth={2} />
              Booked
            </span>
            {cleanPhone && (
              <a
                href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(`Hi ${listing.vendorName || "Vendor"}, I am contacting you regarding your SoundScout rental listing "${listing.equipmentSummary}".`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 font-mono text-[11px] font-bold text-white shadow-sm hover:bg-[#20bd5a] transition-all"
              >
                <MessageSquare size={13} /> Contact Vendor
              </a>
            )}
          </div>
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
