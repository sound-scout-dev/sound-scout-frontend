import FormField from "../FormField"
import Button from "../Button"
import { EVENT_TYPES } from "../../services/mockData"

function StepBasics({ values, errors, onChange, onNext }) {
  const setField = (name) => (e) => onChange(name, e.target.value)

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink-navy">Event basics</h2>
      <p className="mt-1 font-body text-sm text-slate">
        The AI consultant uses these details to size the plan.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
          label="Venue dimensions"
          name="venueDimensions"
          placeholder="e.g. 40m x 25m, outdoor"
          value={values.venueDimensions}
          onChange={setField("venueDimensions")}
          error={errors.venueDimensions}
        />

        <FormField
          label="Estimated budget (USD)"
          name="budget"
          type="number"
          min="1"
          placeholder="e.g. 15000"
          value={values.budget}
          onChange={setField("budget")}
          error={errors.budget}
        />

        <FormField
          label="Location"
          name="location"
          placeholder="e.g. Riverside Park, Austin TX"
          value={values.location}
          onChange={setField("location")}
          error={errors.location}
        />
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
