const BARS = [30, 55, 40, 70, 90, 60, 100, 75, 50, 85, 65, 95, 45, 72, 58, 88, 40, 62]

function Corner({ className }) {
  return <span className={`absolute h-4 w-4 border-signal-amber/60 ${className}`} />
}

function SignalPanel() {
  return (
    <div
      className="relative flex h-56 flex-col justify-between rounded-sm border border-signal-amber/20 bg-ink-navy p-4 sm:h-64"
      style={{
        backgroundImage:
          "linear-gradient(rgba(31,138,112,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(31,138,112,0.08) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      <Corner className="left-2 top-2 border-l-2 border-t-2" />
      <Corner className="right-2 top-2 border-r-2 border-t-2" />
      <Corner className="bottom-2 left-2 border-b-2 border-l-2" />
      <Corner className="bottom-2 right-2 border-b-2 border-r-2" />

      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-paper/50">
        <span>SIG—01 · Audio Input</span>
        <span className="flex items-center gap-1.5 text-alert-red">
          <span className="h-1.5 w-1.5 rounded-full bg-alert-red animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex flex-1 items-end justify-between gap-[3px] px-1 py-4">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={`w-full origin-bottom rounded-[1px] animate-eq-bounce ${
              i % 3 === 0 ? "bg-circuit-teal" : "bg-signal-amber"
            }`}
            style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.09}s` }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-paper/10 pt-2 font-mono text-[9px] text-paper/30">
        <span>-24dB</span>
        <span>-12dB</span>
        <span>0dB</span>
      </div>
    </div>
  )
}

export default SignalPanel
