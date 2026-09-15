import { createContext, useContext, useState, useEffect } from "react"

const STORAGE_KEY = "soundscout.session"
const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
    }
    window.addEventListener("soundscout.session_expired", handleExpired)
    return () => window.removeEventListener("soundscout.session_expired", handleExpired)
  }, [])

  function login(nextUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  // Patches fields on the stored session without a full re-login -- e.g. after
  // subscribePremium() succeeds, so is_premium reflects immediately instead of
  // requiring the user to log out and back in.
  function updateUser(patch) {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  async function logout() {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "/api"
      await fetch(apiBase + "/users/logout", {
        method: "POST",
        credentials: "include"
      })
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
