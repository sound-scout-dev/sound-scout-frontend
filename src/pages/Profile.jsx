import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { updateProfile } from "../services/api"
import FormField from "../components/FormField"
import Button from "../components/Button"
import { User, Mail, MapPin } from "lucide-react"

function Profile() {
  const { user, login } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [region, setRegion] = useState(user?.region || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const updated = await updateProfile({ name, email, region })
      login({ ...user, ...updated })
      setSuccess("Profile updated successfully!")
    } catch (err) {
      console.error(err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-md border border-slate/15 bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-ink-navy">Profile Settings</h1>
        <p className="mt-1 font-body text-sm text-slate">
          Update your account details and settings.
        </p>

        <form onSubmit={handleSave} className="mt-8 space-y-6">
          {error && (
            <p className="font-mono text-xs text-alert-red bg-alert-red/10 rounded px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="font-mono text-xs text-circuit-teal bg-circuit-teal/10 rounded px-3 py-2">
              {success}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-navy flex items-center gap-1.5">
                <User size={16} className="text-slate/60" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded border border-slate/25 px-3.5 py-2 font-body text-sm text-ink-navy placeholder:text-slate/40 focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-navy flex items-center gap-1.5">
                <Mail size={16} className="text-slate/60" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded border border-slate/25 px-3.5 py-2 font-body text-sm text-ink-navy placeholder:text-slate/40 focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
              />
            </div>

            {user?.role === "vendor" && (
              <div>
                <label className="block text-sm font-medium text-ink-navy flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate/60" />
                  Working District / Area
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1 block w-full rounded border border-slate/25 px-3.5 py-2 font-body text-sm text-ink-navy focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
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

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
