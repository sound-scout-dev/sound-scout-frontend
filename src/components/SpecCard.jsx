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

function formatLKR(n) {
  return "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 })
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
  }, [loop, startRevealed])

  const isVisible = (idx) => idx < visibleCount

  return (
    <div
      className={`overflow-hidden rounded-md border border-slate/15 bg-paper shadow-2xl shadow-black/30 ${className}`}
    >
      <div className="border-b border-slate/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-navy">
            <Radar size={14} className="text-signal-amber animate-pulse" />
            AI Infrastructure Plan
          </span>
          <span
            className={`h-2 w-2 rounded-full ${
              phase === "done" ? "bg-circuit-teal" : "bg-signal-amber animate-ping"
            }`}
          />
        </div>
      </div>

      <div className="p-6">
        <div className="font-display text-lg font-semibold text-ink-navy">
          {plan.eventType}
        </div>
        <div className="mt-1 font-mono text-xs text-slate">{plan.meta}</div>

        <div className="mt-6 space-y-5">
          {sequence.current.reduce((acc, node, i) => {
            if (node.type === "category") {
              acc.push(
                <div
                  key={`cat-${node.cat.name}`}
                  className={isVisible(i) ? "animate-reveal-line" : "opacity-0"}
                >
                  <h4 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-circuit-teal">
                    {node.cat.name}
                  </h4>
                </div>
              )
            } else if (node.type === "item") {
              const labelText = node.item.label;
              const optionalMatch = labelText.match(/^(.*?)\s*\(Optional:\s*(.*?)\)$/i);
              const isOptional = !!optionalMatch;
              const cleanLabel = isOptional ? optionalMatch[1] : labelText;
              const optionalComment = isOptional ? optionalMatch[2] : "";

              acc.push(
                <div
                  key={`item-${node.cat.name}-${node.item.label}`}
                  className={`flex flex-col border-b border-slate/10 pb-1.5 transition-all duration-300 ${
                    isOptional 
                      ? "border-alert-red/30 bg-alert-red/5 px-2.5 py-2 my-1 rounded border shadow-sm" 
                      : ""
                  } ${
                    isVisible(i) ? "animate-reveal-line" : "opacity-0"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className={`font-body text-sm ${isOptional ? "text-alert-red font-semibold" : "text-ink-navy"}`}>
                      {cleanLabel}
                    </span>
                    <span className="font-mono text-xs font-semibold text-ink-navy">
                      {node.item.qty}x
                    </span>
                  </div>
                  {isOptional && (
                    <p className="mt-1 font-body text-[11px] text-alert-red/80 italic leading-snug">
                      * Not compulsory: {optionalComment}
                    </p>
                  )}
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
          {formatLKR(plan.priceRange.low)} – {formatLKR(plan.priceRange.high)}
        </span>
      </div>
    </div>
  )
}

export default SpecCard
