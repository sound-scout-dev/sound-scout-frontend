// Mock API layer. Every call simulates network latency and returns
// shaped data — swap the internals for real fetch/axios calls later
// without touching any component that imports from here.

const DELAY_MS = 500

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS))
}

export async function login({ email, role }) {
  return delay({
    token: "mock-token",
    user: { email, role },
  })
}

export async function register({ email, role, fullName, businessName, equipmentCategory }) {
  return delay({
    token: "mock-token",
    user: { email, role, fullName, businessName, equipmentCategory },
  })
}
