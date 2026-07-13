import { useState } from "react"
import { Gavel, Loader2, Pencil, Trash2, Plus, Check, X } from "lucide-react"
import SpecCard from "../SpecCard"
import Button from "../Button"

function StepResults({ plan, onPlanChange, onEdit, onPublish, publishing = false }) {
  const [isEditing, setIsEditing] = useState(false)
  const [localPlan, setLocalPlan] = useState(plan)

  function formatLKR(n) {
    return "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 })
  }

  function recalculatePrice(updatedPlan) {
    let total = 0
    updatedPlan.categories.forEach((cat) => {
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
    
    updatedPlan.priceRange = {
      low: Math.round((total * 0.85) / 100) * 100,
      high: Math.round((total * 1.15) / 100) * 100,
    }
    return updatedPlan
  }

  function updateItemLabel(catIdx, itemIdx, val) {
    const updated = JSON.parse(JSON.stringify(localPlan))
    updated.categories[catIdx].items[itemIdx].label = val
    const recalculated = recalculatePrice(updated)
    setLocalPlan(recalculated)
  }

  function updateItemQty(catIdx, itemIdx, val) {
    const updated = JSON.parse(JSON.stringify(localPlan))
    updated.categories[catIdx].items[itemIdx].qty = Number(val) || 1
    const recalculated = recalculatePrice(updated)
    setLocalPlan(recalculated)
  }

  function deleteItem(catIdx, itemIdx) {
    const updated = JSON.parse(JSON.stringify(localPlan))
    updated.categories[catIdx].items.splice(itemIdx, 1)
    const recalculated = recalculatePrice(updated)
    setLocalPlan(recalculated)
  }

  function addItem(catIdx) {
    const updated = JSON.parse(JSON.stringify(localPlan))
    updated.categories[catIdx].items.push({ label: "New Equipment Item", qty: 1 })
    const recalculated = recalculatePrice(updated)
    setLocalPlan(recalculated)
  }

  function handleSave() {
    onPlanChange(localPlan)
    setIsEditing(false)
  }

  function handleCancel() {
    setLocalPlan(plan)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="font-mono text-xs uppercase tracking-widest text-circuit-teal">
        Plan ready
      </p>
      <h2 className="mt-2 text-center font-display text-xl font-semibold text-ink-navy">
        {isEditing ? "Edit Infrastructure Spec" : "Your infrastructure plan"}
      </h2>
      <p className="mt-1 max-w-md text-center font-body text-sm text-slate">
        {isEditing 
          ? "Modify equipment names, quantities, or categories to customize your event spec sheet."
          : "Review the spec below, then publish it for vendors to bid on — or go back and adjust the details."}
      </p>

      <div className="mt-8 w-full max-w-lg">
        {isEditing ? (
          <div className="rounded-md border border-slate/15 bg-white p-6 shadow-sm space-y-6">
            {localPlan.categories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-circuit-teal border-b border-slate/10 pb-1 flex justify-between items-center">
                  <span>{cat.name}</span>
                </h3>
                <div className="space-y-2">
                  {cat.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateItemLabel(catIdx, itemIdx, e.target.value)}
                        className="flex-1 rounded border border-slate/25 px-2.5 py-1 text-sm text-ink-navy focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItemQty(catIdx, itemIdx, e.target.value)}
                        className="w-16 rounded border border-slate/25 px-2 py-1 text-sm font-mono text-center text-ink-navy focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => deleteItem(catIdx, itemIdx)}
                        className="text-slate/40 hover:text-alert-red transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addItem(catIdx)}
                  className="mt-2 text-xs font-mono text-circuit-teal hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add equipment line
                </button>
              </div>
            ))}

            <div className="mt-6 flex items-center justify-between rounded border border-signal-amber/30 bg-signal-amber/10 px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate">
                Recalculated Price Range
              </span>
              <span className="font-mono text-base font-semibold text-ink-navy">
                {formatLKR(localPlan.priceRange.low)} – {formatLKR(localPlan.priceRange.high)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate/10">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                <X size={14} /> Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSave}>
                <Check size={14} /> Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <SpecCard plan={plan} loop={false} startRevealed />
        )}
      </div>

      {!isEditing && (
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline-dark"
            size="lg"
            className="flex-1"
            onClick={onEdit}
            disabled={publishing}
          >
            Adjust inputs
          </Button>
          <Button
            type="button"
            variant="outline-dark"
            size="lg"
            className="flex-1"
            onClick={() => setIsEditing(true)}
            disabled={publishing}
          >
            <Pencil size={16} strokeWidth={2} className="inline mr-1" />
            Edit Items
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onPublish}
            disabled={publishing}
          >
            {publishing ? <Loader2 size={16} className="animate-spin" /> : <Gavel size={16} strokeWidth={2} />}
            {publishing ? "Publishing…" : "Publish for Bidding"}
          </Button>
        </div>
      )}
    </div>
  )
}

export default StepResults
