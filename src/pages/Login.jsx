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

  const [unverifiedInfo, setUnverifiedInfo] = useState(null)

  const setField = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError("")
    setUnverifiedInfo(null)
    setSubmitting(true)
    try {
      const user = await login(values)
      setSession(user)
      navigate(user.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
    } catch (err) {
      if (err?.status === 403 || err?.message?.includes("Account not verified")) {
        setUnverifiedInfo({
          email: values.email,
          phone: err.phone || "",
          role: err.role || "organizer",
          verificationCode: err.verificationCode,
          botPhone: err.botPhone || ""
        })
      }
      setFormError(err?.message || "We couldn't log you in. Check your details and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-md border border-paper/10 bg-paper p-8 shadow-2xl shadow-black/20">
<<<<<<< HEAD
      <h1 className="font-display text-2xl font-semibold text-ink-navy dark:!text-ink-navy">Log in</h1>
=======
      <h1 className="font-display text-2xl font-semibold text-ink-navy">Log in</h1>
>>>>>>> 22d08c27bb413cfd23ddb2b1f114a8878693c029
      <p className="mt-1 font-body text-sm text-slate">
        Welcome back to SoundScout.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>

<<<<<<< HEAD
        <FormField forceLight
=======
        <FormField
>>>>>>> 22d08c27bb413cfd23ddb2b1f114a8878693c029
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={setField("email")}
          error={errors.email}
          placeholder="you@company.com"
        />

        <div>
<<<<<<< HEAD
          <FormField forceLight
=======
          <FormField
>>>>>>> 22d08c27bb413cfd23ddb2b1f114a8878693c029
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={setField("password")}
            error={errors.password}
            placeholder="••••••••"
          />
          <div className="mt-1.5 text-right">
            <Link
              to="/forgot-password"
              className="font-body text-xs text-[#0891B2] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {formError && (
          <div className="rounded-lg border border-alert-red/30 bg-alert-red/10 p-4 text-sm text-alert-red space-y-3">
            <p className="font-medium">{formError}</p>
            {unverifiedInfo ? (
              <button
                type="button"
                onClick={() => navigate("/verify-otp", { state: { regResponse: unverifiedInfo } })}
                className="inline-flex items-center justify-center w-full rounded-md bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#20bd5a] transition-all"
              >
                Verify Account via WhatsApp Now
              </button>
            ) : (
              <div className="pt-1 flex flex-wrap gap-2 text-xs font-mono">
                <Link to="/forgot-password" className="text-[#0891B2] underline font-semibold hover:text-[#06748f]">
                  Forgot Password?
                </Link>
                <span className="text-slate">•</span>
                <Link to="/register" className="text-signal-amber underline font-semibold hover:text-amber-600">
                  Register New Account
                </Link>
              </div>
            )}
          </div>
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
