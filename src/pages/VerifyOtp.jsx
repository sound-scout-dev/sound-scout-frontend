import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Loader2, KeyRound, MessageSquare, CheckCircle2 } from "lucide-react"
import FormField from "../components/FormField"
import Button from "../components/Button"
import { verifyOtp, checkVerificationStatus } from "../services/api"
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
  const [verifiedSuccess, setVerifiedSuccess] = useState(false)

  const verificationCode = regResponse?.verificationCode
  const botPhone = regResponse?.botPhone || "94XXXXXXXXX"

  // Auto-polling verification status every 2 seconds if verificationCode exists
  useEffect(() => {
    if (!verificationCode || verifiedSuccess) return

    const interval = setInterval(async () => {
      try {
        const status = await checkVerificationStatus(verificationCode)
        if (status?.isVerified) {
          clearInterval(interval)
          setVerifiedSuccess(true)
          setTimeout(() => {
            login({ ...regResponse, is_verified: true, equipmentCategory })
            navigate(regResponse?.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
          }, 1500)
        }
      } catch (err) {
        console.error("Polling verification status error:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [verificationCode, verifiedSuccess, login, navigate, regResponse, equipmentCategory])

  if (!regResponse) {
    return (
      <div className="auth-card text-center py-12 bg-[#ffffff] rounded border border-slate/15 max-w-md mx-auto my-12">
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
      login({ ...regResponse, is_verified: true, equipmentCategory })
      navigate(regResponse.role === "vendor" ? "/vendor/dashboard" : "/organizer/dashboard")
    } catch (err) {
      setError(err?.message || "Invalid or expired OTP. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const cleanPhone = String(botPhone || '').replace(/\D/g, '') || '94784475700'
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(verificationCode || '')}`

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="auth-card rounded-md border border-slate/15 bg-[#ffffff] p-8 shadow-md text-center">
        {verifiedSuccess ? (
          <div className="py-6 space-y-4">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={36} />
            </span>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 font-semibold text-base shadow-sm">
              ✅ Account Verified Successfully!
            </div>
            <p className="text-xs text-slate font-mono">Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] mb-4">
              <KeyRound size={22} />
            </span>
            <h1 className="font-display text-2xl font-semibold text-ink-navy dark:!text-ink-navy">Verify Your WhatsApp</h1>
            <p className="mt-2 font-body text-xs text-slate max-w-xs mx-auto leading-relaxed">
              Click the button below to send your pre-filled verification code on WhatsApp. This window will automatically update once verified.
            </p>

            {verificationCode && (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-slate/15 bg-slate/5 p-3 font-mono text-xs text-ink-navy">
                  <p className="text-[10px] text-slate uppercase tracking-wider">Verification Code</p>
                  <p className="text-lg font-bold tracking-widest text-[#0891B2]">{verificationCode}</p>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#20bd5a]"
                >
                  <MessageSquare size={16} />
                  Verify via WhatsApp
                </a>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleVerify}>
              {error && (
                <p className="font-mono text-xs text-alert-red bg-alert-red/10 rounded px-2.5 py-1.5 text-left">
                  {error}
                </p>
              )}

              <FormField forceLight
                label="Or enter 6-Digit Code manually"
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

            {verificationCode && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate font-mono pt-4">
                <Loader2 size={14} className="animate-spin text-[#0891B2]" />
                <span>Waiting for WhatsApp verification…</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyOtp
