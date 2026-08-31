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
                className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors duration-150 ease-out ${
                  state === "done"
                    ? "bg-[#059669] text-white group-hover:bg-[#047857]"
                    : state === "active"
                      ? "bg-[#0891B2] text-white shadow-sm"
                      : "bg-gray-150 text-gray-400"
                }`}
              >
                {state === "done" ? <Check size={14} strokeWidth={3} /> : String(stepIndex).padStart(2, "0")}
              </span>
              <span
                className={`font-mono text-[10px] uppercase font-bold tracking-widest transition-colors ${
                  state === "upcoming" ? "text-gray-400" : "text-gray-700 group-hover:text-[#0891B2]"
                }`}
              >
                {label}
              </span>
            </div>
            {stepIndex !== STEPS.length && (
              <div
                className={`mx-3 mb-5 h-px flex-1 ${
                  state === "done" ? "bg-[#059669]" : "bg-gray-200"
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
