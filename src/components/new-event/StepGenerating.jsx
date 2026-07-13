import { useEffect, useState, useRef } from "react"
import { Loader2, Check } from "lucide-react"
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

function parseRawPlan(rawPlanArray, formValues, mlCost = 50000, isPremium = false) {
  if (!rawPlanArray || !Array.isArray(rawPlanArray)) return buildInfrastructurePlan(formValues);

  const categories = [
    {
      name: "Equipment List",
      items: rawPlanArray.map(item => {
        const match = item.match(/^(\d+)x\s+(.*)$/);
        if (match) {
          return { label: match[2], qty: parseInt(match[1]) };
        }
        return { label: item, qty: 1 };
      })
    }
  ];

  // Calculate actual estimated market range based on Random Forest ML cost prediction
  const low = isPremium 
    ? Math.round(mlCost * 1.2) 
    : Math.max(10000, Math.round(mlCost * 0.8));
  const high = isPremium 
    ? Math.round(mlCost * 1.6) 
    : Math.max(12000, Math.round(mlCost * 1.2));

  return {
    eventType: formValues.eventType,
    meta: `${Number(formValues.crowdSize).toLocaleString()} guests · ${formValues.location}`,
    categories,
    priceRange: { low, high }
  }
}

function StepGenerating({ formValues, onComplete }) {
  const { user } = useAuth()
  const [logIndex, setLogIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  const [budgetPlan, setBudgetPlan] = useState(null)
  const [premiumPlan, setPremiumPlan] = useState(null)
  const [realId, setRealId] = useState("")

  const [selectedOption, setSelectedOption] = useState("budget") // "budget" | "premium"
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
          environment: formValues.environment,
          requirements: formValues.requirements,
          description: formValues.description
        })
        
        const eventId = created?.event?.event_id ?? created?.event_id ?? created?.id
        if (!eventId) {
          throw new Error("Failed to retrieve event ID from database.")
        }

        // 2. Generate the AI plan (triggers Flask LLM service)
        const generateResponse = await generatePlan(eventId)
        
        // 3. Reconstruct dual-plans from options
        const options = generateResponse?.options || {}
        
        let parsedBudget, parsedPremium;

        if (options.budget_plan && options.premium_plan) {
           const mlCost = options.ml_predicted_cost || 50000;
           parsedBudget = parseRawPlan(options.budget_plan, formValues, mlCost, false);
           parsedPremium = parseRawPlan(options.premium_plan, formValues, mlCost, true);
        } else {
           // fallback if Python returned unexpected struct
           const mlCost = 50000;
           parsedBudget = parseRawPlan(generateResponse?.event?.ai_infrastructure_plan, formValues, mlCost, false)
           parsedPremium = parsedBudget
        }

        if (active) {
          setRealId(eventId)
          setBudgetPlan(parsedBudget)
          setPremiumPlan(parsedPremium)
          setLoading(false)
        }
      } catch (err) {
        console.error("AI Generation Error:", err)
        if (active) {
          setError("AI generation failed. Proceeding with offline design...")
          // Fallback to offline mock plan
          const offlinePlan = buildInfrastructurePlan(formValues)
          setRealId(`evt-fallback-${Date.now()}`)
          setBudgetPlan(offlinePlan)
          setPremiumPlan(offlinePlan)
          setLoading(false)
        }
      }
    }

    triggerBackendPipeline()
    return () => {
      active = false
    }
  }, [formValues, user])

  function handleProceed() {
    if (fired.current) return
    fired.current = true
    const finalPlan = selectedOption === "budget" ? budgetPlan : premiumPlan
    setTimeout(() => onComplete(finalPlan, realId), 300)
  }

  return (
    <div className="flex flex-col items-center">
      <p className="font-mono text-xs uppercase tracking-widest text-signal-amber">
        Analyzing your event
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink-navy">
        {loading ? PROGRESS_LOGS[logIndex] : "Select your preferred infrastructure plan"}
      </h2>
      
      {loading ? (
        <div className="mt-16 flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-10 w-10 animate-spin text-signal-amber" />
          <p className="font-mono text-xs text-slate animate-pulse">
            SoundScout AI agents are collaborating on your quote...
          </p>
        </div>
      ) : (
        <div className="mt-8 w-full max-w-4xl">
          {error && (
            <p className="mb-4 text-center font-mono text-[11px] text-alert-red bg-alert-red/10 rounded px-2.5 py-1">
              {error}
            </p>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Budget Option */}
            <div 
              className={`relative cursor-pointer transition-all duration-200 rounded-xl overflow-hidden border-2 ${selectedOption === 'budget' ? 'border-signal-amber shadow-lg shadow-signal-amber/20 scale-[1.02]' : 'border-slate/20 hover:border-slate/40 opacity-75 hover:opacity-100'}`}
              onClick={() => setSelectedOption('budget')}
            >
              <div className="absolute top-0 left-0 w-full bg-slate/10 py-2 px-4 border-b border-slate/10 flex justify-between items-center z-10">
                <span className="font-display font-medium text-ink-navy">Budget Friendly</span>
                {selectedOption === 'budget' && <Check className="w-4 h-4 text-signal-amber" />}
              </div>
              <div className="pt-12 px-2 pb-2">
                <SpecCard plan={budgetPlan} loop={false} />
              </div>
            </div>

            {/* Premium Option */}
            <div 
              className={`relative cursor-pointer transition-all duration-200 rounded-xl overflow-hidden border-2 ${selectedOption === 'premium' ? 'border-signal-amber shadow-lg shadow-signal-amber/20 scale-[1.02]' : 'border-slate/20 hover:border-slate/40 opacity-75 hover:opacity-100'}`}
              onClick={() => setSelectedOption('premium')}
            >
              <div className="absolute top-0 left-0 w-full bg-slate/10 py-2 px-4 border-b border-slate/10 flex justify-between items-center z-10">
                <span className="font-display font-medium text-ink-navy">Premium Quality</span>
                {selectedOption === 'premium' && <Check className="w-4 h-4 text-signal-amber" />}
              </div>
              <div className="pt-12 px-2 pb-2">
                <SpecCard plan={premiumPlan} loop={false} />
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
             <button
                onClick={handleProceed}
                className="rounded bg-signal-amber px-8 py-3 font-display font-medium text-ink-navy transition-colors duration-150 ease-out hover:bg-[#F2A633] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber shadow-sm"
              >
                Proceed with {selectedOption === 'budget' ? 'Budget' : 'Premium'} Plan
              </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StepGenerating
