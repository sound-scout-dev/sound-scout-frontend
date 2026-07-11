import { useMemo, useRef } from "react"
import SpecCard from "../SpecCard"
import { buildInfrastructurePlan } from "../../services/api"

function StepGenerating({ formValues, onComplete }) {
  const plan = useMemo(() => buildInfrastructurePlan(formValues), [formValues])
  const fired = useRef(false)

  function handleDone() {
    if (fired.current) return
    fired.current = true
    setTimeout(() => onComplete(plan), 500)
  }

  return (
    <div className="flex flex-col items-center">
      <p className="font-mono text-xs uppercase tracking-widest text-signal-amber">
        Analyzing your event
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink-navy">
        Assembling your infrastructure plan…
      </h2>
      <div className="mt-8 w-full max-w-md">
        <SpecCard plan={plan} loop={false} onDone={handleDone} />
      </div>
    </div>
  )
}

export default StepGenerating
