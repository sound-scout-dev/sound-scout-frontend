import FormField from "../FormField"
import Button from "../Button"
import { EVENT_TYPES } from "../../services/mockData"

function StepBasics({ values, errors, onChange, onNext }) {
  const setField = (name) => (e) => onChange(name, e.target.value)

  const toggleRequirement = (req) => {
    const current = values.requirements || []
    if (current.includes(req)) {
      onChange("requirements", current.filter((r) => r !== req))
    } else {
      onChange("requirements", [...current, req])
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink-navy">Event basics</h2>
      <p className="mt-1 font-body text-sm text-slate">
        The AI consultant uses these details to size the plan.
      </p>

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
          <label className="block text-sm font-medium text-ink-navy">Environment</label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate">
              <input
                type="radio"
                name="environment"
                value="Indoor"
                checked={values.environment === "Indoor"}
                onChange={setField("environment")}
                className="text-signal-amber focus:ring-signal-amber"
              />
              Indoor
            </label>
            <label className="flex items-center gap-2 text-sm text-slate">
              <input
                type="radio"
                name="environment"
                value="Outdoor"
                checked={values.environment === "Outdoor"}
                onChange={setField("environment")}
                className="text-signal-amber focus:ring-signal-amber"
              />
              Outdoor
            </label>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink-navy">Requirements</label>
          <div className="mt-2 flex flex-wrap gap-4">
            {["Audio", "Lighting", "Staging", "Visuals", "Power"].map((req) => (
              <label key={req} className="flex items-center gap-2 text-sm text-slate">
                <input
                  type="checkbox"
                  checked={(values.requirements || []).includes(req)}
                  onChange={() => toggleRequirement(req)}
                  className="rounded text-signal-amber focus:ring-signal-amber"
                />
                {req}
              </label>
            ))}
          </div>
          {errors.requirements && (
            <p className="mt-1 text-xs text-alert-red">{errors.requirements}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="button" variant="primary" size="lg" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}

export default StepBasics
