import { useEffect, useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import SpecCard from "../SpecCard"
import { createEvent, generatePlan, buildInfrastructurePlan } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

const PROGRESS_LOGS = [
  "Analyzing event parameters...",
  "Contacting Audio Specialist Agent...",
  "Synthesizing visual and lighting requirements...",
  "Running Random Forest pricing model...",
  "Auditing power load calculations...",
  "Assembling final design plan..."
]

function StepGenerating({ formValues, onComplete }) {
  const { user } = useAuth()
  const [logIndex, setLogIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [realPlan, setRealPlan] = useState(null)
  const [realId, setRealId] = useState("")
  const fired = useRef(false)

  // Cycle through progress logs for clean UX during the 10-15s AI pipeline wait
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % PROGRESS_LOGS.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => {
    let active = true
    async function triggerBackendPipeline() {
      try {
        const budgetRange = `${formValues.budgetMin}-${formValues.budgetMax}`
        
        // 1. Create the event
        const created = await createEvent({
          organizerId: user?.id,
          eventType: formValues.eventType,
          crowdSize: formValues.crowdSize,
          venueSizeSqm: formValues.venueSizeSqm,
          budgetRange,
        })
        
        const eventId = created?.event?.event_id ?? created?.event_id ?? created?.id
        if (!eventId) {
          throw new Error("Failed to retrieve event ID from database.")
        }

        // 2. Generate the AI plan (triggers Flask LLM service)
        const generateResponse = await generatePlan(eventId)
        
        // 3. Reconstruct backend plan structure for the display SpecCard
        const rawPlan = generateResponse?.event?.ai_infrastructure_plan ?? generateResponse?.ai_infrastructure_plan
        let parsedPlan;

        if (rawPlan && Array.isArray(rawPlan)) {
          const categories = [
            {
              name: "Equipment List",
              items: rawPlan.map(item => {
                const match = item.match(/^(\d+)x\s+(.*)$/);
                if (match) {
                  return { label: match[2], qty: parseInt(match[1]) };
                }
                return { label: item, qty: 1 };
              })
            }
          ];
          parsedPlan = {
            eventType: formValues.eventType,
            meta: `${Number(formValues.crowdSize).toLocaleString()} guests · ${formValues.location}`,
            categories,
            priceRange: { 
              low: Math.round(Number(formValues.budgetMin)) || 50000, 
              high: Math.round(Number(formValues.budgetMax)) || 150000 
            }
          }
        } else {
          // fallback
          parsedPlan = buildInfrastructurePlan(formValues)
        }

        if (active) {
          setRealId(eventId)
          setRealPlan(parsedPlan)
          setLoading(false)
        }
      } catch (err) {
        console.error("AI Generation Error:", err)
        if (active) {
          setError("AI generation failed. Proceeding with offline design...")
          // Fallback to offline mock plan
          const offlinePlan = buildInfrastructurePlan(formValues)
          setRealId(`evt-fallback-${Date.now()}`)
          setRealPlan(offlinePlan)
          setLoading(false)
        }
      }
    }

    triggerBackendPipeline()
    return () => {
      active = false
    }
  }, [formValues, user])

  function handleDone() {
    if (fired.current) return
    fired.current = true
    setTimeout(() => onComplete(realPlan, realId), 500)
  }

  return (
    <div className="flex flex-col items-center">
      <p className="font-mono text-xs uppercase tracking-widest text-signal-amber">
        Analyzing your event
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink-navy">
        {loading ? PROGRESS_LOGS[logIndex] : "Assembling your infrastructure plan…"}
      </h2>
      
      {loading ? (
        <div className="mt-16 flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-10 w-10 animate-spin text-signal-amber" />
          <p className="font-mono text-xs text-slate animate-pulse">
            SoundScout AI agents are collaborating on your quote...
          </p>
        </div>
      ) : (
        <div className="mt-8 w-full max-w-md">
          {error && (
            <p className="mb-4 text-center font-mono text-[11px] text-alert-red bg-alert-red/10 rounded px-2.5 py-1">
              {error}
            </p>
          )}
          <SpecCard plan={realPlan} loop={false} onDone={handleDone} />
        </div>
      )}
    </div>
  )
}

export default StepGenerating
