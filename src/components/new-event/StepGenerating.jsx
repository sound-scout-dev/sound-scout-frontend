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

function getHeuristicPrice(categories) {
  let total = 0
  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      const qty = Number(item.qty) || 1
      const label = item.label.toLowerCase()
      let price = 5000 // default base
      
      if (label.includes("speaker") || label.includes("pa system") || label.includes("array")) {
        price = label.includes("line array") ? 25000 : 10000
      } else if (label.includes("subwoofer")) {
        price = 15000
      } else if (label.includes("mixer") || label.includes("console")) {
        price = label.includes("digital") ? 20000 : 8000
      } else if (label.includes("mic") || label.includes("microphone")) {
        price = label.includes("wireless") ? 5000 : 1500
      } else if (label.includes("screen") || label.includes("projector") || label.includes("led wall")) {
        price = label.includes("led screen") || label.includes("led wall") ? 75000 : 25000
      } else if (label.includes("light") || label.includes("par") || label.includes("moving head")) {
        price = label.includes("moving head") ? 8000 : 2000
      } else if (label.includes("generator") || label.includes("power")) {
        price = 45000
      } else if (label.includes("stage") || label.includes("deck") || label.includes("truss")) {
        price = 30000
      }
      
      total += price * qty
    })
  })
  return total
}

function parseRawPlan(rawPlanData, formValues, mlCost = 50000, isPremium = false) {
  if (!rawPlanData) return buildInfrastructurePlan(formValues);

  let categories = [];
  
  if (Array.isArray(rawPlanData)) {
    categories = [
      {
        name: "Equipment List",
        items: rawPlanData.map(item => {
          const match = item.match(/^(\d+)x\s+(.*)$/);
          if (match) {
            return { label: match[2], qty: parseInt(match[1]) };
          }
          return { label: item, qty: 1 };
        })
      }
    ];
  } else if (typeof rawPlanData === 'object') {
    categories = Object.entries(rawPlanData).map(([name, items]) => {
      return {
        name,
        items: Array.isArray(items) ? items.map(item => {
          const match = item.match(/^(\d+)x\s+(.*)$/);
          if (match) {
            return { label: match[2], qty: parseInt(match[1]) };
          }
          return { label: item, qty: 1 };
        }) : []
      };
    });
  } else {
    return buildInfrastructurePlan(formValues);
  }

  const heuristicTotal = getHeuristicPrice(categories);
  const low = isPremium 
    ? Math.round((heuristicTotal * 1.25) / 100) * 100
    : Math.round((heuristicTotal * 0.85) / 100) * 100;
  const high = isPremium 
    ? Math.round((heuristicTotal * 1.6) / 100) * 100
    : Math.round((heuristicTotal * 1.15) / 100) * 100;

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
  const [feasibilityWarning, setFeasibilityWarning] = useState(null)
  const [priceCuttingTips, setPriceCuttingTips] = useState([])

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
          description: formValues.description,
          location: formValues.location
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
          setFeasibilityWarning(options.feasibility_warning || null)
          setPriceCuttingTips(options.price_cutting_tips || [])
          setLoading(false)
        }
      } catch (err) {
        console.error("AI Generation Error:", err)
        if (active) {
          setError("AI generation failed. Proceeding with offline design...")
          // Fallback to offline mock plan
          const offlinePlan = buildInfrastructurePlan(formValues)
          const offlinePremium = {
            ...offlinePlan,
            priceRange: {
              low: Math.round(offlinePlan.priceRange.low * 1.4),
              high: Math.round(offlinePlan.priceRange.high * 1.5)
            }
          }
          setRealId(`evt-fallback-${Date.now()}`)
          setBudgetPlan(offlinePlan)
          setPremiumPlan(offlinePremium)
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
    // Pass warning and tips to final plan so they can be reviewed/edited in next steps if needed
    const enrichedPlan = {
      ...finalPlan,
      feasibilityWarning,
      priceCuttingTips,
    }
    setTimeout(() => onComplete(enrichedPlan, realId), 300)
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

          {feasibilityWarning && (
            <div className="mb-8 rounded-lg border border-signal-amber/30 bg-signal-amber/5 p-5 shadow-sm">
              <h3 className="font-display font-semibold text-ink-navy text-sm flex items-center gap-2">
                ⚠️ Budget Feasibility Warning
              </h3>
              <p className="mt-2 font-body text-xs text-slate">
                {feasibilityWarning}
              </p>
              {priceCuttingTips && priceCuttingTips.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate/10">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate font-semibold">
                    AI Suggested Adjustments for MVP (Minimum Viable Product):
                  </h4>
                  <ul className="mt-2 space-y-1.5 font-body text-xs text-ink-navy list-disc list-inside">
                    {priceCuttingTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
