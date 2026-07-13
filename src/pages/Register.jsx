import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import RoleToggle from "../components/RoleToggle"
import FormField from "../components/FormField"
import Button from "../components/Button"
import { register } from "../services/api"
import { EQUIPMENT_CATEGORIES } from "../services/mockData"
import { useAuth } from "../context/AuthContext"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}

  if (!values.fullName.trim()) {
    errors.fullName = "Enter your full name."
  }
  if (!values.email.trim()) {
    errors.email = "Enter your email address."
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = "Enter a valid email address, like name@example.com."
  }
  if (!values.password) {
    errors.password = "Choose a password."
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords don't match."
  }

  if (values.role === "vendor") {
    if (!values.region.trim()) {
      errors.region = "Enter your region, e.g. Colombo 03."
    }
    if (!values.equipmentCategory) {
      errors.equipmentCategory = "Select your equipment category."
    }
  }

  return errors
}

const initialValues = {
  role: "organizer",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  region: "",
  equipmentCategory: "",
}

function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  
  const roleParam = searchParams.get("role")
  const initialRole = roleParam === "vendor" || roleParam === "organizer" ? roleParam : "organizer"

  const [values, setValues] = useState(() => ({
    ...initialValues,
    role: initialRole
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const setField = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError("")
    setSubmitting(true)
    try {
      const user = await register(values)
      // equipmentCategory isn't part of the backend's User schema — kept in the
      // session client-side since the vendor-matching UI reads it from here.
      login({ ...user, equipmentCategory: values.equipmentCategory })
      navigate(user.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
    } catch {
      setFormError("We couldn't create your account. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-md border border-paper/10 bg-paper p-8 shadow-2xl shadow-black/20">
      <h1 className="font-display text-2xl font-semibold text-ink-navy">Create an account</h1>
      <p className="mt-1 font-body text-sm text-slate">
        Get started with SoundScout.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <span className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-slate">
            I am a
          </span>
          <RoleToggle value={values.role} onChange={(role) => setValues((v) => ({ ...v, role }))} />
        </div>

        <FormField
          label="Full name"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={setField("fullName")}
          error={errors.fullName}
          placeholder="Jordan Lee"
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={setField("email")}
          error={errors.email}
          placeholder="you@company.com"
        />

        {values.role === "vendor" && (
          <>
            <FormField
              as="select"
              label="Working District / Area"
              name="region"
              value={values.region}
              onChange={setField("region")}
              error={errors.region}
            >
              <option value="">Select your working district...</option>
              {["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Matara", "Kurunegala", "Jaffna", "Badulla", "Anuradhapura"].map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </FormField>

            <FormField
              as="select"
              label="Equipment category"
              name="equipmentCategory"
              value={values.equipmentCategory}
              onChange={setField("equipmentCategory")}
              error={errors.equipmentCategory}
            >
              <option value="">Select a category…</option>
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </FormField>
          </>
        )}

        {/* Backend's UserRegistration schema has no password field yet — collected
            here for expected signup UX, but not sent until the API supports it. */}
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={setField("password")}
          error={errors.password}
          placeholder="At least 8 characters"
        />

        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={setField("confirmPassword")}
          error={errors.confirmPassword}
          placeholder="••••••••"
        />

        {formError && (
          <p className="rounded border border-alert-red/30 bg-alert-red/10 px-3 py-2 text-sm text-alert-red">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-slate">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-ink-navy underline decoration-signal-amber decoration-2 underline-offset-2 hover:text-signal-amber"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}

export default Register
