import { useState, useEffect } from "react"
import { CalendarDays, MapPin, Users, CheckCircle2, ChevronDown, ChevronUp, Info } from "lucide-react"
import Button from "./Button"

const EQUIPMENT_TO_PLAN_CATEGORY = {
  "Audio Equipment": "Audio",
  "Lighting Equipment": "Lighting",
  "Staging & Trussing": "Staging",
  "Visuals & Screens": "Visuals",
  "Power & Generation": "Power"
}

function formatLKR(n) {
  return "Rs. " + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function getHeuristicPriceForCategories(categories, targetCategories) {
  let total = 0
  categories.forEach(cat => {
    if (targetCategories.includes(cat.name)) {
      cat.items.forEach(item => {
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
    }
  })
  return total
}

function OpportunityCard({ event, vendor, hasBid, onPlaceBid }) {
  const allCategoryNames = event.plan.categories.map((c) => c.name)
  const mappedVendorCategory = EQUIPMENT_TO_PLAN_CATEGORY[vendor?.equipmentCategory]
  
  const [selectedCategories, setSelectedCategories] = useState(() => {
    if (mappedVendorCategory && allCategoryNames.includes(mappedVendorCategory)) {
      return [mappedVendorCategory]
    }
    return allCategoryNames
  })
  const [showDetails, setShowDetails] = useState(false)

  // Reset or adjust if event categories change
  useEffect(() => {
    if (mappedVendorCategory && allCategoryNames.includes(mappedVendorCategory)) {
      setSelectedCategories([mappedVendorCategory])
    } else {
      setSelectedCategories(allCategoryNames)
    }
  }, [event.id])

  function toggleCategory(catName) {
    if (selectedCategories.includes(catName)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== catName))
      }
    } else {
      setSelectedCategories([...selectedCategories, catName])
    }
  }

  // Calculate scaled cost for chosen categories
  const totalHeuristic = getHeuristicPriceForCategories(event.plan.categories, allCategoryNames)
  const selectedHeuristic = getHeuristicPriceForCategories(event.plan.categories, selectedCategories)
  const ratio = totalHeuristic > 0 ? (selectedHeuristic / totalHeuristic) : 1

  const priceLow = event.plan.priceRange?.low || (selectedHeuristic * 0.85)
  const priceHigh = event.plan.priceRange?.high || (selectedHeuristic * 1.15)
  
  const adjustedLow = Math.round((priceLow * ratio) / 100) * 100
  const adjustedHigh = Math.round((priceHigh * ratio) / 100) * 100

  // Filter items in details list to selected categories
  const filteredCategories = event.plan.categories.filter((cat) => selectedCategories.includes(cat.name))

  return (
    <div className="flex flex-col rounded-md border border-slate/15 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate/10 pb-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-navy">{event.name}</h3>
          <p className="mt-0.5 font-mono text-xs text-slate">{event.eventType}</p>
        </div>
        
        {/* Toggleable categories */}
        <div className="flex flex-wrap gap-1.5">
          {event.plan.categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.name)
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => toggleCategory(cat.name)}
                className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide transition-all ${
                  isChecked
                    ? "border-circuit-teal bg-circuit-teal/10 text-circuit-teal font-semibold shadow-sm"
                    : "border-slate/15 bg-transparent text-slate hover:bg-slate/5"
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs text-slate">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={13} strokeWidth={2} />
          {formatDate(event.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} strokeWidth={2} />
          {event.crowdSize.toLocaleString()} guests
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={13} strokeWidth={2} />
          {event.location}
        </span>
      </div>

      {/* Render existing collaborative bids */}
      {event.existing_bids && event.existing_bids.length > 0 && (
        <div className="mt-4 rounded-md border border-circuit-teal/20 bg-circuit-teal/5 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-circuit-teal font-semibold flex items-center gap-1">
            <Info size={11} /> Collaborative Bid Status
          </p>
          <div className="mt-2 space-y-1.5">
            {event.existing_bids.map((bid) => {
              let bidCats = []
              if (bid.bid_categories) {
                bidCats = typeof bid.bid_categories === 'string'
                  ? JSON.parse(bid.bid_categories)
                  : bid.bid_categories
              }
              return (
                <div key={bid.bid_id} className="flex justify-between items-center text-xs font-body text-slate">
                  <span>
                    <strong className="text-ink-navy">{bid.vendor_name}</strong> covers: {bidCats.join(', ')}
                  </span>
                  <span className="font-mono font-semibold text-ink-navy">{formatLKR(bid.proposed_price)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Accordion list details */}
      <div className="mt-3 border-t border-slate/5 pt-2">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full font-mono text-[11px] uppercase tracking-widest text-slate hover:text-ink-navy transition-colors py-1"
        >
          <span>{showDetails ? "Hide Equipment Details" : "Show Equipment Details"}</span>
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDetails && (
          <div className="mt-3 rounded bg-slate/5 p-3 space-y-3 border border-slate/10 max-h-60 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <p className="text-xs text-slate italic text-center py-2">No categories selected.</p>
            ) : (
              filteredCategories.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <h4 className="font-mono text-[10px] font-bold text-circuit-teal uppercase tracking-wider border-b border-circuit-teal/15 pb-0.5">
                    {cat.name}
                  </h4>
                  <ul className="space-y-1">
                    {cat.items.map((item, idx) => {
                      const labelText = item.label
                      const optionalMatch = labelText.match(/^(.*?)\s*\(Optional:\s*(.*?)\)$/i)
                      const isOptional = !!optionalMatch
                      const cleanLabel = isOptional ? optionalMatch[1] : labelText
                      const comment = isOptional ? optionalMatch[2] : ""

                      return (
                        <li key={idx} className="flex flex-col text-xs font-body py-0.5">
                          <div className="flex justify-between">
                            <span className={isOptional ? "text-alert-red font-semibold" : "text-ink-navy"}>
                              {cleanLabel}
                            </span>
                            <span className="font-mono text-slate font-medium">
                              {typeof item.qty === "string" && item.qty.endsWith("x") ? item.qty : `${item.qty}x`}
                            </span>
                          </div>
                          {isOptional && (
                            <p className="text-[10px] text-alert-red/75 italic leading-tight mt-0.5">
                              * Optional: {comment}
                            </p>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded border border-signal-amber/30 bg-signal-amber/10 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate">
          Est. cost {selectedCategories.length < allCategoryNames.length && "(Adjusted)"}
        </span>
        <span className="font-mono text-sm font-semibold text-ink-navy">
          {formatLKR(adjustedLow)} – {formatLKR(adjustedHigh)}
        </span>
      </div>

      <div className="mt-4 border-t border-slate/10 pt-3">
        {hasBid ? (
          <span className="flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-circuit-teal">
            <CheckCircle2 size={15} strokeWidth={2} />
            Bid submitted
          </span>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onPlaceBid(event, selectedCategories)}
            className="w-full sm:w-auto"
          >
            Place Bid
          </Button>
        )}
      </div>
    </div>
  )
}

export default OpportunityCard
