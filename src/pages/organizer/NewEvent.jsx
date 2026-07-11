import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import WizardProgress from "../../components/new-event/WizardProgress"
import StepBasics from "../../components/new-event/StepBasics"
import StepDescription from "../../components/new-event/StepDescription"
import StepGenerating from "../../components/new-event/StepGenerating"
import StepResults from "../../components/new-event/StepResults"

const initialValues = {
  eventType: "",
  date: "",
  crowdSize: "",
  venueDimensions: "",
  budget: "",
  location: "",
  description: "",
}

function validateBasics(values) {
  const errors = {}
  if (!values.eventType) errors.eventType = "Select an event type."
  if (!values.date) errors.date = "Choose an event date."
  if (!values.crowdSize) {
    errors.crowdSize = "Enter the expected number of guests."
  } else if (Number(values.crowdSize) <= 0) {
    errors.crowdSize = "Enter a valid number of guests."
  }
  if (!values.venueDimensions.trim()) errors.venueDimensions = "Describe the venue dimensions."
  if (!values.budget) {
    errors.budget = "Enter your estimated budget."
  } else if (Number(values.budget) <= 0) {
    errors.budget = "Enter a valid budget amount."
  }
  if (!values.location.trim()) errors.location = "Enter the event location."
  return errors
}

function validateDescription(values) {
  const errors = {}
  if (values.description.trim().length < 20) {
    errors.description = "Add a bit more detail — at least 20 characters."
  }
  return errors
}

function NewEvent() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [plan, setPlan] = useState(null)

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function handleBasicsNext() {
    const nextErrors = validateBasics(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) setStep(2)
  }

  function handleDescriptionNext() {
    const nextErrors = validateDescription(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) setStep(3)
  }

  function handlePlanComplete(generatedPlan) {
    setPlan(generatedPlan)
    setStep(4)
  }

  function handleEdit() {
    setErrors({})
    setStep(1)
  }

  function handlePublish() {
    const id = `evt-${Date.now()}`
    navigate(`/organizer/events/${id}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink-navy">New event</h1>
        <Link
          to="/organizer/dashboard"
          className="flex items-center gap-1.5 rounded p-1.5 text-sm text-slate transition-colors duration-150 ease-out hover:text-ink-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber"
        >
          <X size={16} strokeWidth={2} />
          Cancel
        </Link>
      </div>

      <div className="mt-8">
        <WizardProgress currentStep={step} />
      </div>

      <div className="mt-10 rounded-md border border-slate/15 bg-white p-6 sm:p-8">
        {step === 1 && (
          <StepBasics values={values} errors={errors} onChange={setField} onNext={handleBasicsNext} />
        )}
        {step === 2 && (
          <StepDescription
            values={values}
            errors={errors}
            onChange={setField}
            onNext={handleDescriptionNext}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <StepGenerating formValues={values} onComplete={handlePlanComplete} />}
        {step === 4 && plan && <StepResults plan={plan} onEdit={handleEdit} onPublish={handlePublish} />}
      </div>
    </div>
  )
}

export default NewEvent
