import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import FormField from "../components/FormField"
import Button from "../components/Button"
import { login } from "../services/api"
import { useAuth } from "../context/AuthContext"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}
  if (!values.email.trim()) {
    errors.email = "Enter your email address."
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = "Enter a valid email address, like name@example.com."
  }
  if (!values.password) {
    errors.password = "Enter your password."
  }
  return errors
}

function Login() {
  const navigate = useNavigate()
  const { login: setSession } = useAuth()
  const [values, setValues] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const setField = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))

  // No login endpoint exists on the backend yet — this stays mocked (any
  // password is accepted), but writes into the same AuthContext session used
  // by real registration, so downstream pages don't care how the session started.
  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError("")
    setSubmitting(true)
    try {
      const user = await login(values)
      setSession(user)
      navigate(user.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
    } catch {
      setFormError("We couldn't log you in. Check your details and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-md border border-paper/10 bg-paper p-8 shadow-2xl shadow-black/20">
      <h1 className="font-display text-2xl font-semibold text-ink-navy">Log in</h1>
      <p className="mt-1 font-body text-sm text-slate">
        Welcome back to SoundScout.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>

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

        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={setField("password")}
          error={errors.password}
          placeholder="••••••••"
        />

        {formError && (
          <p className="rounded border border-alert-red/30 bg-alert-red/10 px-3 py-2 text-sm text-alert-red">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-slate">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-ink-navy underline decoration-signal-amber decoration-2 underline-offset-2 hover:text-signal-amber"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}

export default Login
