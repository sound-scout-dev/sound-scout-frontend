// Mock API layer. Every call simulates network latency and returns
// shaped data — swap the internals for real fetch/axios calls later
// without touching any component that imports from here.

import { PLAN_TEMPLATES, mockEvents, mockBids, EQUIPMENT_TO_PLAN_CATEGORY } from "./mockData"

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

// Synchronous plan assembly. The New Event wizard renders this straight into
// the SpecCard, whose own reveal animation supplies the "generating" feedback —
// no separate spinner needed on top of it.
export function buildInfrastructurePlan(formData) {
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

  return {
    eventType,
    meta: `${Number(crowdSize).toLocaleString()} guests · ${location}`,
    categories,
    priceRange,
  }
}

export async function generateInfrastructurePlan(formData) {
  return delay(buildInfrastructurePlan(formData), 2600)
}

export async function getEventById(id) {
  const event = mockEvents.find((e) => e.id === id)
  if (!event) return delay(null)
  return delay({ ...event, plan: buildInfrastructurePlan(event) })
}

export async function listBidsForEvent(id) {
  return delay(mockBids[id] ?? [])
}

export async function acceptBid(eventId, bidId) {
  return delay({ eventId, bidId, status: "booked" })
}

export async function publishEvent(eventId) {
  return delay({ eventId, status: "bidding_open" })
}

export async function listVendorOpportunities(equipmentCategory) {
  const neededCategory = EQUIPMENT_TO_PLAN_CATEGORY[equipmentCategory]

  const opportunities = mockEvents
    .filter((event) => event.status === "bidding_open")
    .map((event) => ({ ...event, plan: buildInfrastructurePlan(event) }))
    .filter(
      (event) =>
        !neededCategory || event.plan.categories.some((cat) => cat.name === neededCategory)
    )

  return delay(opportunities)
}

export async function listVendorBids(vendorName) {
  const bids = Object.entries(mockBids).flatMap(([eventId, eventBids]) => {
    const event = mockEvents.find((e) => e.id === eventId)
    return eventBids
      .filter((bid) => bid.vendorName === vendorName)
      .map((bid) => ({ ...bid, eventId, eventName: event?.name ?? "Unknown event" }))
  })

  return delay(bids)
}

export async function submitBid({ eventId, vendorName, price, notes, rating }) {
  const bid = {
    id: `bid-${Date.now()}`,
    vendorName,
    price: Number(price),
    notes,
    rating,
    status: "pending",
  }

  if (!mockBids[eventId]) mockBids[eventId] = []
  mockBids[eventId].push(bid)

  return delay(bid)
}
