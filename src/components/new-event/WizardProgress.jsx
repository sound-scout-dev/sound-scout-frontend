import { Check } from "lucide-react"

const STEPS = ["Basics", "Description", "Generating", "Plan"]

function WizardProgress({ currentStep, onStepClick }) {
  return (
    <ol className="flex items-center">
      {STEPS.map((label, i) => {
        const stepIndex = i + 1
        const state =
          stepIndex < currentStep ? "done" : stepIndex === currentStep ? "active" : "upcoming"
        const isClickable = onStepClick && (stepIndex < currentStep || (currentStep === 4 && stepIndex < 4));

        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div 
              className={`flex flex-col items-center gap-1.5 ${isClickable ? 'cursor-pointer group' : ''}`}
              onClick={() => isClickable && onStepClick(stepIndex)}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-semibold transition-colors duration-150 ease-out ${
                  state === "done"
                    ? "bg-circuit-teal text-paper group-hover:bg-circuit-teal/80"
                    : state === "active"
                      ? "bg-signal-amber text-ink-navy"
                      : "bg-slate/10 text-slate/50"
                }`}
              >
                {state === "done" ? <Check size={15} strokeWidth={3} /> : String(stepIndex).padStart(2, "0")}
              </span>
              <span
                className={`font-mono text-[11px] uppercase tracking-widest transition-colors ${
                  state === "upcoming" ? "text-slate/40" : "text-ink-navy group-hover:text-signal-amber"
                }`}
              >
                {label}
              </span>
            </div>
            {stepIndex !== STEPS.length && (
              <div
                className={`mx-3 mb-5 h-px flex-1 ${
                  state === "done" ? "bg-circuit-teal" : "bg-slate/15"
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default WizardProgress
