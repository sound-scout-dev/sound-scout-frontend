import React from "react"

const STATUS_MAP = {
  pending: { label: "Pending", className: "border-[#0891B2]/30 bg-[#0891B2]/5 text-[#0891B2]" },
  accepted: { label: "Accepted", className: "border-[#059669]/30 bg-[#059669]/5 text-[#059669]" },
  declined: { label: "Not selected", className: "border-gray-200 bg-gray-50 text-gray-500" },
}

function BidStatusBadge({ status }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${config.className}`}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {config.label}
    </span>
  )
}

export default BidStatusBadge
