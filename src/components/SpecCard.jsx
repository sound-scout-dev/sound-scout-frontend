import { useEffect, useRef, useState } from "react"
import { Radar } from "lucide-react"

function buildSequence(plan) {
  const seq = [{ type: "header" }]
  plan.categories.forEach((cat) => {
    seq.push({ type: "category", cat })
    cat.items.forEach((item) => seq.push({ type: "item", cat, item }))
  })
  seq.push({ type: "price" })
  return seq
}

function formatUSD(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

/**
 * The product's signature element: assembles an AI-generated infrastructure
 * plan line by line, like a spec sheet printing itself out.
 *
 * loop=true replays it (homepage demo). loop=false plays once and holds on
 * the finished sheet (results / detail screens).
 */
function SpecCard({ plan, loop = false, startRevealed = false, onDone, className = "" }) {
  const sequence = useRef(buildSequence(plan))
  const [phase, setPhase] = useState(startRevealed ? "done" : "thinking") // thinking | revealing | done
  const [visibleCount, setVisibleCount] = useState(startRevealed ? sequence.current.length : 0)

  useEffect(() => {
    if (startRevealed) return
    let timers = []

    const runThinking = () => {
      setPhase("thinking")
      setVisibleCount(0)
      timers.push(setTimeout(runReveal, 700))
    }

    const runReveal = () => {
      setPhase("revealing")
      sequence.current.forEach((_, i) => {
        timers.push(
          setTimeout(() => setVisibleCount(i + 1), i * 200)
        )
      })
      const totalDelay = sequence.current.length * 200
      timers.push(
        setTimeout(() => {
          setPhase("done")
          onDone?.()
        }, totalDelay)
      )
      if (loop) {
        timers.push(setTimeout(runThinking, totalDelay + 3200))
      }
    }

    runThinking()

    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop])

  const isVisible = (index) => visibleCount > index

  return (
    <div
      className={`overflow-hidden rounded-md border border-slate/15 bg-paper shadow-2xl shadow-black/30 ${className}`}
    >
      <div className="flex items-center justify-between bg-ink-navy px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-paper/70">
          <Radar size={14} className="text-signal-amber" strokeWidth={2.5} />
          AI Infrastructure Plan
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-paper/50">
          <span
            className={`h-1.5 w-1.5 rounded-full bg-signal-amber ${
              phase !== "done" ? "animate-pulse" : ""
            }`}
          />
          {phase === "done" ? "complete" : "generating"}
        </span>
      </div>

      <div className="p-5">
        {isVisible(0) ? (
          <div className="animate-reveal-line">
            <h3 className="font-display text-lg font-semibold text-ink-navy">
              {plan.eventType}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-slate">{plan.meta}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-slate/10" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate/10" />
          </div>
        )}

        <div className="mt-5 space-y-5">
          {sequence.current.reduce((acc, node, i) => {
            if (node.type === "category") {
              acc.push(
                <div key={`cat-${node.cat.name}`} className={isVisible(i) ? "animate-reveal-line" : "opacity-0"}>
                  <p className="border-b border-slate/15 pb-1.5 font-mono text-[11px] font-medium uppercase tracking-widest text-circuit-teal">
                    {node.cat.name}
                  </p>
                </div>
              )
            }
            if (node.type === "item") {
              acc.push(
                <div
                  key={`item-${node.cat.name}-${node.item.label}`}
                  className={`flex items-baseline justify-between gap-4 border-b border-slate/10 pb-1.5 ${
                    isVisible(i) ? "animate-reveal-line" : "opacity-0"
                  }`}
                >
                  <span className="font-body text-sm text-ink-navy">{node.item.label}</span>
                  <span className="shrink-0 font-mono text-sm text-slate">{node.item.qty}</span>
                </div>
              )
            }
            return acc
          }, [])}
        </div>
      </div>

      <div
        className={`flex items-center justify-between border-t border-signal-amber/30 bg-signal-amber/10 px-5 py-4 transition-opacity duration-300 ${
          isVisible(sequence.current.length - 1) ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="font-mono text-[11px] uppercase tracking-widest text-slate">
          Estimated cost
        </span>
        <span className="font-mono text-lg font-semibold text-ink-navy">
          {formatUSD(plan.priceRange.low)} – {formatUSD(plan.priceRange.high)}
        </span>
      </div>
    </div>
  )
}

export default SpecCard
