import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Loader2, KeyRound } from "lucide-react"
import FormField from "../components/FormField"
import Button from "../components/Button"
import { verifyOtp } from "../services/api"
import { useAuth } from "../context/AuthContext"

function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Grab the registration details passed from Register.jsx
  const regResponse = location.state?.regResponse
  const equipmentCategory = location.state?.equipmentCategory

  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!regResponse) {
    // If no registration flow in progress, bounce back to login
    return (
      <div className="text-center py-12 bg-white rounded border border-slate/15 max-w-md mx-auto my-12">
        <p className="text-slate font-mono text-sm">No registration session found.</p>
        <button onClick={() => navigate("/login")} className="mt-4 text-xs font-semibold text-circuit-teal underline">
          Go to Login
        </button>
      </div>
    )
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      await verifyOtp({ email: regResponse.email, otp })
      // Login context on success
      login({ ...regResponse, is_verified: true, equipmentCategory })
      navigate(regResponse.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
    } catch (err) {
      setError(err?.message || "Invalid or expired OTP. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-md border border-slate/15 bg-white p-8 shadow-md text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] mb-4">
          <KeyRound size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink-navy">Verify Your WhatsApp</h1>
        <p className="mt-2 font-body text-xs text-slate max-w-xs mx-auto leading-relaxed">
          We have dispatched a 6-digit verification code to your WhatsApp number: <strong className="text-ink-navy">{regResponse.phone}</strong>.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleVerify}>
          {error && (
            <p className="font-mono text-xs text-alert-red bg-alert-red/10 rounded px-2.5 py-1.5 text-left">
              {error}
            </p>
          )}

          <FormField
            label="6-Digit Verification Code"
            name="otp"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 123456"
            className="text-left font-mono"
          />

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={submitting}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Verifying..." : "Verify & Activate"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default VerifyOtp
