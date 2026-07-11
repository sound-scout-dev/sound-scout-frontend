const STATUS_MAP = {
  planning: { label: "Planning", className: "border-slate/25 bg-slate/10 text-slate" },
  bidding_open: {
    label: "Bidding Open",
    className: "border-signal-amber/40 bg-signal-amber/15 text-ink-navy",
  },
  booked: {
    label: "Booked",
    className: "border-circuit-teal/40 bg-circuit-teal/10 text-circuit-teal",
  },
}

function StatusBadge({ status }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.planning

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}

export default StatusBadge
