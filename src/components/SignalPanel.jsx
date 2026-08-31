import React from "react"

const BARS = [30, 55, 40, 70, 90, 60, 100, 75, 50, 85, 65, 95, 45, 72, 58, 88, 40, 62]

function Corner({ className }) {
  return <span className={`absolute h-3 w-3 border-[#0891B2]/30 ${className}`} />
}

function SignalPanel() {
  return (
    <div
      className="relative flex h-56 flex-col justify-between rounded-xl bg-glass p-4 sm:h-64 animate-fade-in-up"
      style={{
        backgroundImage:
          "linear-gradient(rgba(8,145,178,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(8,145,178,0.03) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      <Corner className="left-2 top-2 border-l-2 border-t-2" />
      <Corner className="right-2 top-2 border-r-2 border-t-2" />
      <Corner className="bottom-2 left-2 border-b-2 border-l-2" />
      <Corner className="bottom-2 right-2 border-b-2 border-r-2" />

      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-gray-500">
        <span>SIG—01 · Audio Spectrum</span>
        <span className="flex items-center gap-1.5 text-red-650">
          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex flex-1 items-end justify-between gap-[4px] px-1 py-4">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={`w-full origin-bottom rounded-[1px] animate-eq-bounce ${
              i % 3 === 0 ? "bg-[#059669]" : "bg-[#0891B2]"
            }`}
            style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.09}s` }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/40 pt-2 font-mono text-[9px] text-gray-400">
        <span>-24dB</span>
        <span>-12dB</span>
        <span>0dB</span>
      </div>
    </div>
  )
}

export default SignalPanel
