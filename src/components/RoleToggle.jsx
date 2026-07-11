import { Building2, Wrench } from "lucide-react"

const ROLES = [
  { value: "organizer", label: "Event Organizer", icon: Building2 },
  { value: "vendor", label: "Rental Vendor", icon: Wrench },
]

function RoleToggle({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Account type"
      className="grid grid-cols-2 gap-2 rounded border border-slate/20 bg-paper p-1"
    >
      {ROLES.map((role) => {
        const active = value === role.value
        return (
          <button
            key={role.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(role.value)}
            className={`flex items-center justify-center gap-2 rounded px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber ${
              active
                ? "bg-ink-navy text-paper"
                : "text-slate hover:bg-ink-navy/5"
            }`}
          >
            <role.icon size={16} strokeWidth={2} />
            {role.label}
          </button>
        )
      })}
    </div>
  )
}

export default RoleToggle
