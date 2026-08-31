import FormField from "../FormField"
import Button from "../Button"

function StepDescription({ values, errors, onChange, onNext, onBack }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink-navy">
        Tell us more about the event
      </h2>
      <p className="mt-1 font-body text-sm text-slate">
        Vibe, must-haves, past events you're modeling this on — anything that
        helps shape the plan.
      </p>

      <div className="mt-6">
        <FormField
          as="textarea"
          label="Event description"
          name="description"
          rows={7}
          placeholder="e.g. A high-energy outdoor festival with three back-to-back live acts, a main stage and a smaller DJ tent, expecting a mostly-standing crowd..."
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          error={errors.description}
        />
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="button" variant="primary" size="lg" onClick={onNext}>
          Generate plan
        </Button>
      </div>
    </div>
  )
}

export default StepDescription
