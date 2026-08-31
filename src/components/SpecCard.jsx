import { useEffect, useRef, useState } from "react"
import { Radar } from "lucide-react"

function buildSequence(plan) {
  if (!plan || !Array.isArray(plan.categories)) return [{ type: "header" }, { type: "price" }]
  const seq = [{ type: "header" }]
  plan.categories.forEach((cat) => {
    if (!cat) return
    seq.push({ type: "category", cat })
    if (Array.isArray(cat.items)) {
      cat.items.forEach((item) => {
        if (item) seq.push({ type: "item", cat, item })
      })
    }
  })
  seq.push({ type: "price" })
  return seq
}

function formatLKR(n) {
  return "Rs. " + (n || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })
}

/**
 * The product's signature element: assembles an AI-generated infrastructure
 * plan line by line, like a spec sheet printing itself out.
 *
 * loop=true replays it (homepage demo). loop=false plays once and holds on
 * the finished sheet (results / detail screens).
 */
function SpecCard({ plan, loop = false, startRevealed = false, onDone, className = "" }) {
  const sequence = buildSequence(plan)
  const [phase, setPhase] = useState(startRevealed ? "done" : "thinking") // thinking | revealing | done
  const [visibleCount, setVisibleCount] = useState(startRevealed ? sequence.length : 0)

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
      sequence.forEach((_, i) => {
        timers.push(
          setTimeout(() => setVisibleCount(i + 1), i * 200)
        )
      })
      const totalDelay = sequence.length * 200
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
  }, [loop, startRevealed, plan])

  const isVisible = (idx) => idx < visibleCount

  return (
    <div
      className={`overflow-hidden rounded-xl bg-glass shadow-lg animate-fade-in-up ${className}`}
    >
      <div className="border-b border-white/40 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-800">
            <Radar size={13} className="text-[#0891B2] animate-pulse" />
            AI Infrastructure Plan
          </span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${phase === "done" ? "bg-[#059669]" : "bg-[#0891B2] animate-ping"
              }`}
          />
        </div>
      </div>

      <div className="p-6">
        <div className="font-display text-lg font-semibold text-gray-900">
          {plan?.eventType || "Event Infrastructure Spec"}
        </div>
        <div className="mt-1 font-mono text-xs text-gray-500">{plan?.meta || ""}</div>

        <div className="mt-6 space-y-5">
          {sequence.reduce((acc, node, i) => {
            if (node.type === "category" && node.cat) {
              acc.push(
                <div
                  key={`cat-${node.cat.name}-${i}`}
                  className={isVisible(i) ? "animate-reveal-line" : "opacity-0"}
                >
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0891B2]">
                    {node.cat.name}
                  </h4>
                </div>
              )
            } else if (node.type === "item" && node.item) {
              const labelText = String(node.item.label || "Equipment Line");
              const optionalMatch = labelText.match(/^(.*?)\s*\(Optional:\s*(.*?)\)$/i);
              const isOptional = !!optionalMatch;
              const cleanLabel = isOptional ? optionalMatch[1] : labelText;
              const optionalComment = isOptional ? optionalMatch[2] : "";

              acc.push(
                <div
                  key={`item-${node.cat?.name || 'cat'}-${i}`}
                  className={`flex flex-col border-b border-gray-100 pb-1.5 transition-all duration-300 ${isOptional
                      ? "border-red-200 bg-red-50/50 px-2.5 py-2 my-1 rounded border shadow-sm"
                      : ""
                    } ${isVisible(i) ? "animate-reveal-line" : "opacity-0"
                    }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className={`font-body text-sm ${isOptional ? "text-red-600 font-semibold" : "text-gray-800"}`}>
                      {cleanLabel}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#059669]">
                      {typeof node.item.qty === "string" && node.item.qty.endsWith("x") ? node.item.qty : `${node.item.qty || 1}x`}
                    </span>
                  </div>
                  {isOptional && (
                    <p className="mt-1 font-body text-[11px] text-red-500/80 italic leading-snug">
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
        className={`flex items-center justify-between border-t border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 px-5 py-4 transition-opacity duration-300 ${isVisible(sequence.length - 1) ? "opacity-100" : "opacity-0"
          }`}
      >
        <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
          Estimated cost
        </span>
        <span className="font-mono text-base font-bold text-gray-900">
          {formatLKR(plan?.priceRange?.low)} – {formatLKR(plan?.priceRange?.high)}
        </span>
      </div>
    </div>
  )
}

export default SpecCard
