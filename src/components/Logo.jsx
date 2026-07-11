import { Radar } from "lucide-react"

function Logo({ dark = true }) {
  const textColor = dark ? "text-paper" : "text-ink-navy"

  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded bg-signal-amber text-ink-navy">
        <Radar size={18} strokeWidth={2.5} />
      </span>
      <span className={`font-display text-lg font-semibold tracking-tight ${textColor}`}>
        SoundScout
      </span>
    </div>
  )
}

export default Logo
