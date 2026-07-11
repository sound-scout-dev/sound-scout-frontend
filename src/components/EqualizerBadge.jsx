const BAR_HEIGHTS = [45, 80, 35, 100, 60, 85, 40, 70]

function EqualizerBadge() {
  return (
    <div className="inline-flex items-center gap-3 rounded-md border border-signal-amber/25 bg-paper/[0.03] px-4 py-3">
      <div className="flex h-8 items-end gap-[3px]">
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="w-1 origin-bottom rounded-full bg-signal-amber animate-eq-bounce"
            style={{ height: `${h}%`, animationDelay: `${i * 0.11}s` }}
          />
        ))}
      </div>
      <div className="flex flex-col">
        <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-signal-amber">
          Live signal
        </span>
        <span className="font-mono text-[10px] text-paper/40">Reading event acoustics</span>
      </div>
    </div>
  )
}

export default EqualizerBadge
