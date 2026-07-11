import { Radar } from "lucide-react"

function SoundRadar() {
  return (
    <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-md border border-signal-amber/20 bg-paper/[0.02] sm:h-64">
      <span
        className="absolute h-20 w-20 rounded-full border border-signal-amber/50 animate-ping"
        style={{ animationDuration: "2.4s" }}
      />
      <span
        className="absolute h-20 w-20 rounded-full border border-circuit-teal/40 animate-ping"
        style={{ animationDuration: "2.4s", animationDelay: "0.8s" }}
      />
      <span
        className="absolute h-20 w-20 rounded-full border border-signal-amber/30 animate-ping"
        style={{ animationDuration: "2.4s", animationDelay: "1.6s" }}
      />

      <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-signal-amber text-ink-navy shadow-lg shadow-signal-amber/30">
        <Radar size={26} strokeWidth={2} />
      </span>

      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-paper/40">
        Scanning vendor network
      </span>
    </div>
  )
}

export default SoundRadar
