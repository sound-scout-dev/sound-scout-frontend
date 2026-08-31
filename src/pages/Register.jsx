import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import RoleToggle from "../components/RoleToggle"
import FormField from "../components/FormField"
import Button from "../components/Button"
import { register, checkVerificationStatus } from "../services/api"
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

  if (!values.phone) {
    errors.phone = "Enter your phone number."
  } else if (!/^(?:\+94|94|0)?7[0-9]{8}$/.test(values.phone.trim().replace(/\s/g, ""))) {
    errors.phone = "Enter a valid Sri Lankan phone number (e.g. 0771234567)."
  }

  return errors
}

const initialValues = {
  role: "organizer",
  fullName: "",
  email: "",
  phone: "",
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

  // Click-to-Verify UI & Polling state
  const [verificationData, setVerificationData] = useState(null)
  const [verifiedSuccess, setVerifiedSuccess] = useState(false)

  const setField = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError("")
    setSubmitting(true)
    try {
      const regResponse = await register(values)
      if (regResponse?.verificationCode) {
        setVerificationData({
          verificationCode: regResponse.verificationCode,
          botPhone: regResponse.botPhone || "94XXXXXXXXX",
          regResponse,
          role: values.role
        })
      } else {
        navigate("/verify-otp", { state: { regResponse, equipmentCategory: values.equipmentCategory } })
      }
    } catch {
      setFormError("We couldn't create your account. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-polling verification status every 2 seconds
  useEffect(() => {
    if (!verificationData?.verificationCode || verifiedSuccess) return

    const interval = setInterval(async () => {
      try {
        const status = await checkVerificationStatus(verificationData.verificationCode)
        if (status?.isVerified) {
          clearInterval(interval)
          setVerifiedSuccess(true)

          setTimeout(() => {
            if (verificationData.regResponse) {
              login({ ...verificationData.regResponse, is_verified: true })
            }
            navigate(verificationData.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
          }, 1500)
        }
      } catch (err) {
        console.error("Polling verification status error:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [verificationData, verifiedSuccess, login, navigate])

  // Verification Screen UI
  if (verificationData) {
    const cleanPhone = String(verificationData.botPhone || '').replace(/\D/g, '')
    const whatsappUrl = cleanPhone ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(verificationData.verificationCode)}` : '#'

    return (
      <div className="auth-card rounded-md border border-paper/10 bg-paper p-8 shadow-2xl shadow-black/20 text-center max-w-lg mx-auto my-8">
        {verifiedSuccess ? (
          <div className="py-6 space-y-4">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Loader2 size={36} className="animate-spin text-emerald-500" />
            </span>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 font-semibold text-base shadow-sm">
              ✅ Account Verified Successfully!
            </div>
            <p className="text-xs text-slate font-mono">Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <div className="space-y-6">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
              <Loader2 size={28} className="animate-spin text-[#25D366]" />
            </span>

            <div>
              <h1 className="font-display text-2xl font-semibold text-ink-navy dark:!text-ink-navy">Verify Your Account</h1>
              <p className="mt-2 font-body text-xs text-slate max-w-sm mx-auto leading-relaxed">
                Click the button below to send your pre-filled verification code on WhatsApp. If WhatsApp doesn't open automatically, send code <span className="font-mono font-bold text-ink-navy">{verificationData.verificationCode}</span> directly to <span className="font-mono font-bold text-ink-navy">+{cleanPhone}</span>.
              </p>
            </div>

            <div className="rounded-lg border border-slate/15 bg-slate/5 p-4 font-mono text-xs text-ink-navy space-y-1">
              <p className="text-[11px] text-slate uppercase tracking-wider">Your Verification Code</p>
              <p className="text-xl font-bold tracking-widest text-[#0891B2]">{verificationData.verificationCode}</p>
              {cleanPhone && <p className="text-[11px] text-slate/75">WhatsApp Bot Number: +{cleanPhone}</p>}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full rounded-lg bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#20bd5a] hover:shadow-xl active:scale-[0.98]"
            >
              Verify via WhatsApp
            </a>

            <div className="flex items-center justify-center gap-2 text-xs text-slate font-mono pt-2">
              <Loader2 size={14} className="animate-spin text-[#0891B2]" />
              <span>Waiting for WhatsApp verification…</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="auth-card rounded-md border border-paper/10 bg-paper p-8 shadow-2xl shadow-black/20">
      <h1 className="font-display text-2xl font-semibold text-ink-navy dark:!text-ink-navy">Create an account</h1>
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

        <FormField forceLight
          label="Full name"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={setField("fullName")}
          error={errors.fullName}
          placeholder="Jordan Lee"
        />

        <FormField forceLight
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={setField("email")}
          error={errors.email}
          placeholder="you@company.com"
        />

        <FormField forceLight
          label="WhatsApp Phone Number"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={setField("phone")}
          error={errors.phone}
          placeholder="e.g. 0771234567"
        />

        {values.role === "vendor" && (
          <>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-slate">
                Working Districts / Areas (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Matara", "Kurunegala", "Jaffna", "Badulla", "Anuradhapura"].map((dist) => {
                  const isSelected = values.region && values.region.split(', ').includes(dist);
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => {
                        let currentDistricts = values.region ? values.region.split(', ').filter(Boolean) : [];
                        if (currentDistricts.includes(dist)) {
                          currentDistricts = currentDistricts.filter(d => d !== dist);
                        } else {
                          currentDistricts.push(dist);
                        }
                        setValues(v => ({ ...v, region: currentDistricts.join(', ') }));
                      }}
                      className={`rounded-lg border p-2.5 text-left text-xs font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-[#0891B2]/50 bg-[#0891B2]/10 backdrop-blur-md text-[#0891B2] shadow-md scale-[1.02]"
                          : "border-gray-200 bg-white/60 backdrop-blur-sm text-gray-600 hover:border-[#0891B2]/30 hover:bg-gray-50/50"
                      }`}
                    >
                      {dist}
                    </button>
                  );
                })}
              </div>
              {errors.region && (
                <p className="mt-1 font-mono text-[10px] text-alert-red">{errors.region}</p>
              )}
            </div>

            <FormField forceLight
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
        <FormField forceLight
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={setField("password")}
          error={errors.password}
          placeholder="At least 8 characters"
        />

        <FormField forceLight
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
