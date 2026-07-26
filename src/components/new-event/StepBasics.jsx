import { useState } from "react"
import FormField from "../FormField"
import Button from "../Button"
import { EVENT_TYPES } from "../../services/mockData"
import { Mic } from "lucide-react"
import VoiceInputModal from "./VoiceInputModal"

function StepBasics({ values, errors, onChange, onNext, onVoiceIntake }) {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false)
  const setField = (name) => (e) => onChange(name, e.target.value)

  const toggleRequirement = (req) => {
    const current = values.requirements || []
    if (current.includes(req)) {
      onChange("requirements", current.filter((r) => r !== req))
    } else {
      onChange("requirements", [...current, req])
    }
  }

  const handleVoiceData = (parameters) => {
    onVoiceIntake?.(parameters)
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-gray-900">Event basics</h2>
      <p className="mt-1 font-body text-sm text-gray-500">
        The AI consultant uses these details to size the plan.
      </p>

      {/* Modern speak-to-auto-fill box in brand colors */}
      <div className="mt-5 flex items-center justify-between border border-[#0891B2]/20 bg-[#0891B2]/5 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0891B2]/10 text-[#0891B2]">
            <Mic size={18} strokeWidth={2.5} className="animate-pulse" />
          </span>
          <div>
            <h4 className="font-display text-sm font-semibold text-gray-900">Speak to Auto-Fill</h4>
            <p className="font-body text-xs text-gray-500">Describe your event (English, Sinhala, Singlish) to auto-fill form.</p>
          </div>
        </div>
        <Button type="button" variant="primary" size="sm" onClick={() => setIsVoiceOpen(true)} className="shadow-sm">
          Record Voice
        </Button>
      </div>

      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onDataExtracted={handleVoiceData}
      />

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <FormField
          label="Event name"
          name="eventName"
          placeholder="e.g. Riverside Summer Fest"
          value={values.eventName}
          onChange={setField("eventName")}
          error={errors.eventName}
          className="sm:col-span-2"
        />

        <FormField
          as="select"
          label="Event type"
          name="eventType"
          value={values.eventType}
          onChange={setField("eventType")}
          error={errors.eventType}
        >
          <option value="">Select a type…</option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </FormField>

        <FormField
          label="Event date"
          name="date"
          type="date"
          value={values.date}
          onChange={setField("date")}
          error={errors.date}
        />

        <FormField
          label="Expected crowd size"
          name="crowdSize"
          type="number"
          min="1"
          placeholder="e.g. 300"
          value={values.crowdSize}
          onChange={setField("crowdSize")}
          error={errors.crowdSize}
        />

        <FormField
          label="Venue size (m²) - Optional"
          name="venueSizeSqm"
          type="number"
          min="1"
          placeholder="e.g. 500 (Leave blank if unknown)"
          value={values.venueSizeSqm}
          onChange={setField("venueSizeSqm")}
          error={errors.venueSizeSqm}
        />

        <FormField
          label="Budget min (LKR)"
          name="budgetMin"
          type="number"
          min="1"
          placeholder="e.g. 15000"
          value={values.budgetMin}
          onChange={setField("budgetMin")}
          error={errors.budgetMin}
        />

        <FormField
          label="Budget max (LKR)"
          name="budgetMax"
          type="number"
          min="1"
          placeholder="e.g. 20000"
          value={values.budgetMax}
          onChange={setField("budgetMax")}
          error={errors.budgetMax}
        />

        <FormField
          label="Location"
          name="location"
          placeholder="e.g. Riverside Park, Austin TX"
          value={values.location}
          onChange={setField("location")}
          error={errors.location}
          className="sm:col-span-2"
        />

        <div className="sm:col-span-2">
          <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">Environment</label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="environment"
                value="Indoor"
                checked={values.environment === "Indoor"}
                onChange={setField("environment")}
                className="text-[#0891B2] focus:ring-[#0891B2] border-gray-300"
              />
              Indoor
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                name="environment"
                value="Outdoor"
                checked={values.environment === "Outdoor"}
                onChange={setField("environment")}
                className="text-[#0891B2] focus:ring-[#0891B2] border-gray-300"
              />
              Outdoor
            </label>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">Requirements</label>
          <div className="mt-2 flex flex-wrap gap-4">
            {["Audio", "Lighting", "Staging", "Visuals", "Power"].map((req) => (
              <label key={req} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                <input
                  type="checkbox"
                  checked={(values.requirements || []).includes(req)}
                  onChange={() => toggleRequirement(req)}
                  className="rounded text-[#0891B2] focus:ring-[#0891B2] border-gray-300"
                />
                {req}
              </label>
            ))}
          </div>
          {errors.requirements && (
            <p className="mt-1 text-xs text-red-500">{errors.requirements}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="button" variant="primary" size="lg" onClick={onNext} className="shadow-md">
          Continue
        </Button>
      </div>
    </div>
  )
}

export default StepBasics
