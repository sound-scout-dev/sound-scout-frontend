import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { updateProfile } from "../services/api"
import Button from "../components/Button"
import { User, Mail, MapPin, KeyRound, ShieldAlert } from "lucide-react"

function Profile() {
  const { user, login } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [region, setRegion] = useState(user?.region || "")
  
  // Password change states
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.")
      return
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password && password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const updated = await updateProfile({ name, email, region, password: password || undefined })
      login({ ...user, ...updated })
      setSuccess("Profile updated successfully!")
      setPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error(err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between border-b border-slate/15 pb-5">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold leading-7 text-ink-navy sm:text-3xl sm:truncate">
            Account Settings
          </h1>
          <p className="mt-1 font-body text-sm text-slate">
            Manage your personal profile, credentials, and settings.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {error && (
          <p className="font-mono text-xs text-alert-red bg-alert-red/10 rounded px-3 py-2 flex items-center gap-2">
            <ShieldAlert size={16} />
            {error}
          </p>
        )}
        {success && (
          <p className="font-mono text-xs text-circuit-teal bg-circuit-teal/10 rounded px-3 py-2">
            {success}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Section 1: Personal Details */}
          <div className="rounded-md border border-slate/15 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold text-ink-navy border-b border-slate/10 pb-2 flex items-center gap-2">
              <User size={18} className="text-signal-amber" />
              Personal Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate font-mono">
                  Full Name
                </label>
                <div className="mt-1 relative rounded shadow-sm">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded border border-slate/25 px-3 py-2 font-body text-sm text-ink-navy placeholder:text-slate/40 focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate font-mono">
                  Email Address
                </label>
                <div className="mt-1 relative rounded shadow-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded border border-slate/25 px-3 py-2 font-body text-sm text-ink-navy placeholder:text-slate/40 focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
                  />
                </div>
              </div>

              {user?.role === "vendor" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate font-mono flex items-center gap-1">
                    <MapPin size={12} />
                    Working District / Area
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-1 block w-full rounded border border-slate/25 px-3 py-2 font-body text-sm text-ink-navy focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
                  >
                    <option value="">Select your working district...</option>
                    {["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Matara", "Kurunegala", "Jaffna", "Badulla", "Anuradhapura"].map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Security & Credentials */}
          <div className="rounded-md border border-slate/15 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold text-ink-navy border-b border-slate/10 pb-2 flex items-center gap-2">
              <KeyRound size={18} className="text-circuit-teal" />
              Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate font-mono">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="mt-1 block w-full rounded border border-slate/25 px-3 py-2 font-body text-sm text-ink-navy placeholder:text-slate/40 focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate font-mono">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-1 block w-full rounded border border-slate/25 px-3 py-2 font-body text-sm text-ink-navy placeholder:text-slate/40 focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate/10">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Profile
