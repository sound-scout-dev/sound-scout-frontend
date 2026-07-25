// Thin fetch wrapper for the endpoints that are wired to the real backend.
// Mocked functions elsewhere in services/ intentionally don't use this —
// see api.js for which is which and why.

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api"

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers }
  
  try {
    const session = JSON.parse(localStorage.getItem("soundscout.session") || "{}")
    if (session?.token) {
      headers["Authorization"] = `Bearer ${session.token}`
    }
  } catch (_) {}

  let response = await fetch(`${API_BASE}${path}`, {
    headers,
    credentials: "include",
    ...options,
  })

  let isJson = response.headers.get("content-type")?.includes("application/json")
  let body = isJson ? await response.json().catch(() => null) : null

  // If unauthorized (401), attempt to silently refresh the token
  if (response.status === 401 && path !== "/users/login" && path !== "/users/refresh") {
    try {
      const refreshResponse = await fetch(`${API_BASE}/users/refresh`, {
        method: "POST",
        credentials: "include"
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        if (refreshData?.accessToken) {
          // Update the session in local storage
          try {
            const session = JSON.parse(localStorage.getItem("soundscout.session") || "{}")
            session.token = refreshData.accessToken
            localStorage.setItem("soundscout.session", JSON.stringify(session))
          } catch (_) {}

          // Retry the original request with the new access token
          headers["Authorization"] = `Bearer ${refreshData.accessToken}`
          response = await fetch(`${API_BASE}${path}`, {
            headers,
            credentials: "include",
            ...options,
          })
          isJson = response.headers.get("content-type")?.includes("application/json")
          body = isJson ? await response.json().catch(() => null) : null
        }
      } else {
        // Refresh token itself expired or invalid, log out the user
        localStorage.removeItem("soundscout.session")
        window.dispatchEvent(new Event("soundscout.session_expired"))
        throw new ApiError("Session expired. Please log in again.", 401)
      }
    } catch (refreshErr) {
      localStorage.removeItem("soundscout.session")
      window.dispatchEvent(new Event("soundscout.session_expired"))
      throw new ApiError("Session expired. Please log in again.", 401)
    }
  }

  if (!response.ok) {
    throw new ApiError(body?.error ?? body?.message ?? `Request to ${path} failed (${response.status}).`, response.status)
  }

  return body
}
