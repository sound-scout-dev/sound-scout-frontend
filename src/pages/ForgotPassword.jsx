import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, KeyRound, MessageSquare, CheckCircle2, Lock } from "lucide-react"
import FormField from "../components/FormField"
import Button from "../components/Button"
import { forgotPassword, resetPassword, checkVerificationStatus } from "../services/api"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ForgotPassword() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Step 2 state: reset info
  const [resetData, setResetData] = useState(null) // { resetCode, botPhone, email }
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false)

  // Password reset fields
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)

  // Auto-polling verification status every 2s for the RESET- code
  useEffect(() => {
    if (!resetData?.resetCode || isCodeConfirmed) return

    const interval = setInterval(async () => {
      try {
        const status = await checkVerificationStatus(resetData.resetCode)
        if (status?.isVerified) {
          clearInterval(interval)
          setIsCodeConfirmed(true)
        }
      } catch (err) {
        console.error("Polling reset code error:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [resetData, isCodeConfirmed])

  async function handleRequestCode(e) {
    e.preventDefault()
    if (!email.trim()) {
      setEmailError("Enter your email address.")
      return
    } else if (!EMAIL_RE.test(email)) {
      setEmailError("Enter a valid email address.")
      return
    }
    setEmailError("")
    setFormError("")
    setSubmitting(true)

    try {
      const res = await forgotPassword({ email })
      setResetData({
        resetCode: res.resetCode,
        botPhone: res.botPhone || "",
        email: res.email || email
      })
    } catch (err) {
      setFormError(err?.message || "No account found with this email address.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }

    setPasswordError("")
    setFormError("")
    setSubmitting(true)

    try {
      await resetPassword({
        email: resetData.email,
        code: resetData.resetCode,
        newPassword
      })
      setResetSuccess(true)
      setTimeout(() => navigate("/login"), 2500)
    } catch (err) {
      setFormError(err?.message || "Failed to reset password. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-md border border-paper/10 bg-paper p-8 shadow-2xl shadow-black/20">
        {resetSuccess ? (
          <div className="text-center py-6 space-y-4">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={36} />
            </span>
            <h2 className="font-display text-xl font-semibold text-ink-navy">Password Reset Complete!</h2>
            <p className="text-xs text-slate font-mono">Your password has been updated. Redirecting to login…</p>
            <Button onClick={() => navigate("/login")} className="w-full mt-4">
              Go to Login
            </Button>
          </div>
        ) : !resetData ? (
          /* Step 1: Request Reset Code */
          <>
            <h1 className="font-display text-2xl font-semibold text-ink-navy">Reset Your Password</h1>
            <p className="mt-1 font-body text-sm text-slate">
              Enter your account email to verify your identity via WhatsApp.
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleRequestCode} noValidate>
              <FormField
                label="Email address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                placeholder="you@company.com"
              />

              {formError && (
                <p className="rounded border border-alert-red/30 bg-alert-red/10 px-3 py-2 text-sm text-alert-red">
                  {formError}
                </p>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Generating code…" : "Request WhatsApp Reset Code"}
              </Button>
            </form>
          </>
        ) : (
          /* Step 2: Verify Code & Set New Password */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0891B2]/10 text-[#0891B2]">
                <KeyRound size={22} />
              </span>
              <h1 className="font-display text-2xl font-semibold text-ink-navy">Verify & Reset Password</h1>
              <p className="font-body text-xs text-slate max-w-xs mx-auto">
                Send the reset code via WhatsApp to unlock password change for <strong className="text-ink-navy">{resetData.email}</strong>.
              </p>
            </div>

            <div className="rounded-lg border border-slate/15 bg-slate/5 p-4 text-center font-mono text-xs text-ink-navy space-y-1">
              <p className="text-[10px] text-slate uppercase tracking-wider">Reset Code</p>
              <p className="text-xl font-bold tracking-widest text-[#0891B2]">{resetData.resetCode}</p>
            </div>

            {!isCodeConfirmed ? (
              <div className="space-y-4">
                <a
                  href={`https://wa.me/${String(resetData.botPhone).replace(/\D/g, '')}?text=${encodeURIComponent(resetData.resetCode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full rounded-lg bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#20bd5a]"
                >
                  <MessageSquare size={18} />
                  Verify via WhatsApp
                </a>

                <div className="flex items-center justify-center gap-2 text-xs text-slate font-mono pt-1">
                  <Loader2 size={14} className="animate-spin text-[#0891B2]" />
                  <span>Waiting for WhatsApp confirmation…</span>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCodeConfirmed(true)}
                    className="text-xs text-slate underline hover:text-ink-navy font-mono"
                  >
                    I have sent the code on WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-4 pt-2" onSubmit={handleResetPassword}>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-600 text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Identity Confirmed! Set your new password below.</span>
                </div>

                <FormField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={passwordError}
                  placeholder="At least 8 characters"
                />

                <FormField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />

                {formError && (
                  <p className="rounded border border-alert-red/30 bg-alert-red/10 px-3 py-2 text-xs text-alert-red">
                    {formError}
                  </p>
                )}

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Updating password…" : "Set New Password"}
                </Button>
              </form>
            )}
          </div>
        )}

        <p className="mt-6 text-center font-body text-sm text-slate">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-medium text-ink-navy underline decoration-signal-amber decoration-2 underline-offset-2 hover:text-signal-amber"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
