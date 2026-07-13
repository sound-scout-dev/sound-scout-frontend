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
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
    ...options,
  })

  const isJson = response.headers.get("content-type")?.includes("application/json")
  const body = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new ApiError(body?.message ?? `Request to ${path} failed (${response.status}).`, response.status)
  }

  return body
}
