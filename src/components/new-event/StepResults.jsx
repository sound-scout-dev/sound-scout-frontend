import { Gavel, Pencil } from "lucide-react"
import SpecCard from "../SpecCard"
import Button from "../Button"

function StepResults({ plan, onEdit, onPublish }) {
  return (
    <div className="flex flex-col items-center">
      <p className="font-mono text-xs uppercase tracking-widest text-circuit-teal">
        Plan ready
      </p>
      <h2 className="mt-2 text-center font-display text-xl font-semibold text-ink-navy">
        Your infrastructure plan
      </h2>
      <p className="mt-1 max-w-md text-center font-body text-sm text-slate">
        Review the spec below, then publish it for vendors to bid on — or go back
        and adjust the details.
      </p>

      <div className="mt-8 w-full max-w-md">
        <SpecCard plan={plan} loop={false} startRevealed />
      </div>

      <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline-dark" size="lg" className="flex-1" onClick={onEdit}>
          <Pencil size={16} strokeWidth={2} />
          Edit Plan
        </Button>
        <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onPublish}>
          <Gavel size={16} strokeWidth={2} />
          Publish for Bidding
        </Button>
      </div>
    </div>
  )
}

export default StepResults
