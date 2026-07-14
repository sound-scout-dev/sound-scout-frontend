import { createContext, useContext, useState } from "react"

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

  function login(nextUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
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

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
