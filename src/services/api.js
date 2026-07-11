// Mock API layer. Every call simulates network latency and returns
// shaped data — swap the internals for real fetch/axios calls later
// without touching any component that imports from here.

import { PLAN_TEMPLATES, mockEvents } from "./mockData"

const DELAY_MS = 500

function delay(value, ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function crowdTier(crowdSize) {
  if (crowdSize <= 150) return 0
  if (crowdSize <= 800) return 1
  return 2
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

export async function listOrganizerEvents() {
  return delay(mockEvents)
}

export async function generateInfrastructurePlan(formData) {
  const { eventType, crowdSize, location, budget } = formData
  const tier = crowdTier(Number(crowdSize) || 0)
  const template = PLAN_TEMPLATES[eventType] ?? PLAN_TEMPLATES.Other

  const categories = Object.entries(template).map(([name, items]) => ({
    name,
    items: items
      .map((item) => ({ label: item.label, qty: item.qty[tier] }))
      .filter((item) => item.qty !== "-"),
  }))

  const parsedBudget = Number(budget) || 8000
  const priceRange = {
    low: Math.round((parsedBudget * 0.85) / 100) * 100,
    high: Math.round((parsedBudget * 1.15) / 100) * 100,
  }

  const plan = {
    eventType,
    meta: `${Number(crowdSize).toLocaleString()} guests · ${location}`,
    categories,
    priceRange,
  }

  return delay(plan, 2600)
}
