// Hybrid API layer: functions that have a matching endpoint in the real
// backend's OpenAPI spec call it via httpClient's `request()`. Functions for
// features with no backend support yet (or an undocumented response shape)
// stay on the mock fixtures below, clearly marked, so the app keeps working
// while the backend catches up. See the "wire what exists" plan for the
// reasoning behind each choice.

import { request } from "./httpClient"
import {
  PLAN_TEMPLATES,
  mockEvents,
  mockBids,
  EQUIPMENT_TO_PLAN_CATEGORY,
  instantRentalListings,
} from "./mockData"

const DELAY_MS = 500
const PUBLISHED_EVENTS_KEY = "soundscout.publishedEvents"

function delay(value, ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function crowdTier(crowdSize) {
  if (crowdSize <= 150) return 0
  if (crowdSize <= 800) return 1
  return 2
}

// Events published for real via createEvent()/generatePlan() below, kept
// locally since there's no backend endpoint to list an organizer's own events.
function getLocallyPublishedEvents() {
  try {
    return JSON.parse(localStorage.getItem(PUBLISHED_EVENTS_KEY)) ?? []
  } catch {
    return []
  }
}

export function saveLocallyPublishedEvent(event) {
  const events = getLocallyPublishedEvents()
  events.push(event)
  localStorage.setItem(PUBLISHED_EVENTS_KEY, JSON.stringify(events))
}

// No backend login endpoint exists yet — stays mocked. The caller (Login.jsx)
// writes the returned user into AuthContext so the rest of the app doesn't
// care whether the session came from here or from a real register() call.
export async function login({ email, password }) {
  const session = await request("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  return {
    id: session.user.user_id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    region: session.user.region,
  }
}

// Real call: POST /users/register.
export async function register({ fullName, email, role, region, password }) {
  const payload = { name: fullName, email, role, password }
  if (role === "vendor") payload.region = region

  const created = await request("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return { id: created.user_id, name: created.name, email: created.email, role: created.role, region: created.region }
}

export async function updateProfile({ name, email, region }) {
  const updated = await request("/users/profile", {
    method: "PUT",
    body: JSON.stringify({ name, email, region }),
  })
  return { id: updated.user_id, name: updated.name, email: updated.email, role: updated.role, region: updated.region }
}

// No "list my events" endpoint exists — combine the seeded demo events with
// anything published for real this session/browser via createEvent() below.
export async function listOrganizerEvents() {
  try {
    const backendEvents = await request("/events")
    return (backendEvents ?? []).map((e) => {
      let parsedPlan = null
      if (e.ai_infrastructure_plan) {
        parsedPlan = typeof e.ai_infrastructure_plan === 'string'
          ? JSON.parse(e.ai_infrastructure_plan)
          : e.ai_infrastructure_plan
      }

      // Reconstruct display categories based on the plan shape (single selected vs draft options)
      let displayPlan;
      if (parsedPlan && parsedPlan.categories) {
        displayPlan = parsedPlan;
      } else if (parsedPlan && (parsedPlan.budget_plan || parsedPlan.premium_plan)) {
        const selectedRaw = parsedPlan.budget_plan || parsedPlan.premium_plan;
        const categories = [
          {
            name: "Equipment List",
            items: selectedRaw.map(item => {
              const match = item.match(/^(\d+)x\s+(.*)$/);
              if (match) {
                return { label: match[2], qty: parseInt(match[1]) };
              }
              return { label: item, qty: 1 };
            })
          }
        ];
        let low = 50000;
        let high = 150000;
        if (e.budget_range) {
          const parts = e.budget_range.split('-');
          if (parts.length === 2) {
            low = Math.max(10000, Number(parts[0]) || 50000);
            high = Number(parts[1]) || 150000;
          }
        }
        displayPlan = {
          eventType: e.event_type,
          meta: `${e.crowd_count.toLocaleString()} guests`,
          categories,
          priceRange: { low, high }
        }
      } else if (parsedPlan && Array.isArray(parsedPlan)) {
        const categories = [
          {
            name: "Equipment List",
            items: parsedPlan.map(item => {
              const match = item.match(/^(\d+)x\s+(.*)$/);
              if (match) {
                return { label: match[2], qty: parseInt(match[1]) };
              }
              return { label: item, qty: 1 };
            })
          }
        ];
        let low = 50000;
        let high = 150000;
        if (e.budget_range) {
          const parts = e.budget_range.split('-');
          if (parts.length === 2) {
            low = Math.max(10000, Number(parts[0]) || 50000);
            high = Number(parts[1]) || 150000;
          }
        }
        displayPlan = {
          eventType: e.event_type,
          meta: `${e.crowd_count.toLocaleString()} guests`,
          categories,
          priceRange: { low, high }
        }
      } else {
        displayPlan = buildInfrastructurePlan({
          eventType: e.event_type,
          crowdSize: e.crowd_count,
          venueSizeSqm: e.venue_size_sqm,
          budgetMin: e.budget_range ? e.budget_range.split('-')[0] : 50000,
          budgetMax: e.budget_range ? e.budget_range.split('-')[1] : 150000,
        });
      }

      return {
        id: e.event_id,
        name: e.event_type, // Use event type as fallback event name
        eventType: e.event_type,
        crowdSize: e.crowd_count,
        date: e.created_at || new Date().toISOString(),
        location: e.environment || "Indoor",
        status: e.status || "bidding_open",
        plan: displayPlan,
      }
    })
  } catch (err) {
    // If backend is unreachable, fallback to local/mock data to prevent crashing
    return [...mockEvents, ...getLocallyPublishedEvents()]
  }
}

// Synchronous plan assembly. The New Event wizard renders this straight into
// the SpecCard, whose own reveal animation supplies the "generating" feedback —
// no separate spinner needed on top of it. Also used as a stand-in wherever we
// need to *display* a plan for a real backend event, since the real
// ai_infrastructure_plan's JSON shape isn't documented in the spec yet.
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

// Real call: POST /events. The spec only documents "201: Event created
// successfully" with no response schema — assuming (like any typical REST
// API) that the created event, including its id, comes back in the body.
export async function createEvent({ organizerId, eventType, crowdSize, venueSizeSqm, budgetRange, environment, requirements, description, location }) {
  return request("/events", {
    method: "POST",
    body: JSON.stringify({
      organizer_id: organizerId,
      event_type: eventType,
      crowd_count: Number(crowdSize),
      venue_size_sqm: Number(venueSizeSqm),
      budget_range: budgetRange,
      environment,
      requirements,
      description,
      location,
    }),
  })
}

// Real call: POST /events/{eventId}/generate-plan. This both generates the AI
// plan and opens the event for bidding on the backend in one step — there's
// no separate publish endpoint. The spec doesn't define ai_infrastructure_plan's
// shape, so the wizard keeps showing its own client-side plan preview rather
// than trusting this response's plan content.
export async function generatePlan(eventId) {
  return request(`/events/${eventId}/generate-plan`, { method: "POST" })
}

export async function finalizePlan(eventId, selected_plan) {
  return request(`/events/${eventId}/finalize-plan`, {
    method: "PUT",
    body: JSON.stringify({ selected_plan }),
  })
}

// Real GET /events/{id} endpoint to retrieve a real event from backend.
export async function getEventById(id) {
  try {
    const backendEvent = await request(`/events/${id}`)
    if (backendEvent) {
      const event = {
        id: backendEvent.event_id,
        name: backendEvent.event_type, // Fallback to type if name is not in schema
        eventType: backendEvent.event_type,
        crowdSize: backendEvent.crowd_count,
        venueSizeSqm: backendEvent.venue_size_sqm,
        budget: backendEvent.budget_range,
        location: backendEvent.environment || "Indoor",
        status: backendEvent.status,
        date: backendEvent.created_at || new Date().toISOString(), // Fallback date
      }

      // Reconstruct the structured category display representation safely
      let displayPlan;
      let plan = backendEvent.ai_infrastructure_plan;
      if (plan && typeof plan === 'string') {
        try {
          plan = JSON.parse(plan);
        } catch (e) {
          console.warn("Could not parse AI plan JSON string", e);
        }
      }

      if (plan && plan.categories) {
        displayPlan = plan;
      } else if (plan && (plan.budget_plan || plan.premium_plan)) {
        const selectedRaw = plan.budget_plan || plan.premium_plan;
        const categories = [
          {
            name: "Equipment List",
            items: selectedRaw.map(item => {
              const match = item.match(/^(\d+)x\s+(.*)$/);
              if (match) {
                return { label: match[2], qty: parseInt(match[1]) };
              }
              return { label: item, qty: 1 };
            })
          }
        ];
        let low = 50000;
        let high = 150000;
        if (event.budget) {
          const parts = event.budget.split('-');
          if (parts.length === 2) {
            low = Math.max(10000, Number(parts[0]) || 50000);
            high = Number(parts[1]) || 150000;
          }
        }
        displayPlan = {
          eventType: event.eventType,
          meta: `${event.crowdSize.toLocaleString()} guests`,
          categories,
          priceRange: { low, high }
        }
      } else if (plan && Array.isArray(plan)) {
        const categories = [
          {
            name: "Equipment List",
            items: plan.map(item => {
              const match = item.match(/^(\d+)x\s+(.*)$/);
              if (match) {
                return { label: match[2], qty: parseInt(match[1]) };
              }
              return { label: item, qty: 1 };
            })
          }
        ];
        let low = 50000;
        let high = 150000;
        if (event.budget) {
          const parts = event.budget.split('-');
          if (parts.length === 2) {
            low = Math.max(10000, Number(parts[0]) || 50000);
            high = Number(parts[1]) || 150000;
          }
        }
        displayPlan = {
          eventType: event.eventType,
          meta: `${event.crowdSize.toLocaleString()} guests`,
          categories,
          priceRange: { low, high }
        }
      } else {
        displayPlan = buildInfrastructurePlan(event);
      }

      return { ...event, plan: displayPlan }
    }
  } catch (err) {
    // Fall back to local mock data below
  }

  const event =
    mockEvents.find((e) => e.id === id) ?? getLocallyPublishedEvents().find((e) => e.id === id)
  if (!event) return delay(null)
  return delay({ ...event, plan: buildInfrastructurePlan(event) })
}

// Real call: GET /bids/event/{eventId}, with a fallback to local demo bids —
// seeded mock events aren't real backend ids, so this also covers that case
// without needing to sniff id formats.
export async function listBidsForEvent(eventId) {
  try {
    const bids = await request(`/bids/event/${eventId}`)
    if (Array.isArray(bids)) return bids
  } catch {
    // not a real backend event id, or backend unreachable — fall through to local data
  }
  return delay(mockBids[eventId] ?? [])
}

// Real call: PUT /bids/{bidId}/accept. Local bid/event status is updated by
// the caller regardless, since demo events aren't tracked server-side.
export async function acceptBid(eventId, bidId, organizerId) {
  try {
    await request(`/bids/${bidId}/accept`, {
      method: "PUT",
      body: JSON.stringify({ organizer_id: organizerId }),
    })
  } catch {
    // demo bid not tracked server-side, or backend unreachable
  }
  return delay({ eventId, bidId, status: "booked" })
}

// Used only for the seeded "planning" demo event (evt-3) — real events created
// through the wizard go straight to "bidding_open" via generatePlan() above,
// since the backend has no separate publish step.
export async function publishEvent(eventId) {
  return delay({ eventId, status: "bidding_open" })
}

// Real call: GET /events/open, merged with local demo/published events so the
// vendor feed stays populated even when the backend is unreachable (or hasn't
// implemented this yet). ai_infrastructure_plan's shape is unconfirmed, so a
// display plan is synthesized client-side via buildInfrastructurePlan for
// rendering and category matching.
export async function listVendorOpportunities(equipmentCategory) {
  const neededCategory = EQUIPMENT_TO_PLAN_CATEGORY[equipmentCategory]

  let realEvents = []
  let backendOnline = false
  try {
    const openEvents = await request("/events/open")
    backendOnline = true
    realEvents = (openEvents ?? []).map((e) => {
      let parsedPlan = null;
      if (e.ai_infrastructure_plan) {
        parsedPlan = typeof e.ai_infrastructure_plan === 'string'
          ? JSON.parse(e.ai_infrastructure_plan)
          : e.ai_infrastructure_plan;
      }

      let displayPlan;
      if (parsedPlan && parsedPlan.categories) {
        displayPlan = parsedPlan;
      } else if (parsedPlan && Array.isArray(parsedPlan)) {
        const categories = [
          {
            name: "Equipment List",
            items: parsedPlan.map(item => {
              const match = item.match(/^(\d+)x\s+(.*)$/);
              if (match) {
                return { label: match[2], qty: parseInt(match[1]) };
              }
              return { label: item, qty: 1 };
            })
          }
        ];
        
        let low = 50000;
        let high = 150000;
        if (e.budget_range) {
          const parts = e.budget_range.split('-');
          if (parts.length === 2) {
            low = Math.max(10000, Number(parts[0]) || 50000);
            high = Number(parts[1]) || 150000;
          }
        }
        displayPlan = {
          eventType: e.event_type,
          meta: `${e.crowd_count.toLocaleString()} guests`,
          categories,
          priceRange: { low, high }
        }
      } else {
        displayPlan = buildInfrastructurePlan({
          eventType: e.event_type,
          crowdSize: e.crowd_count,
          venueSizeSqm: e.venue_size_sqm,
          budgetMin: e.budget_range ? e.budget_range.split('-')[0] : 50000,
          budgetMax: e.budget_range ? e.budget_range.split('-')[1] : 150000,
        });
      }

      return {
        id: e.event_id,
        name: e.event_type,
        eventType: e.event_type,
        crowdSize: e.crowd_count,
        date: e.created_at || new Date().toISOString(),
        location: e.environment || "Indoor",
        status: "bidding_open",
        plan: displayPlan,
      }
    })
  } catch (err) {
    // backend unreachable / not implemented yet
  }

  const localEvents = [...mockEvents, ...getLocallyPublishedEvents()].filter(
    (event) => event.status === "bidding_open"
  )

  const opportunities = (backendOnline ? realEvents : localEvents)
    .map((event) => {
      if (event.plan) return event;
      return { ...event, plan: buildInfrastructurePlan(event) };
    })
    .filter(
      (event) => !neededCategory || event.plan.categories.some((cat) => cat.name === neededCategory)
    )

  return delay(opportunities)
}

// No backend endpoint for a vendor's own bid history — stays fully mocked.
export async function listVendorBids(vendorName) {
  const bids = Object.entries(mockBids).flatMap(([eventId, eventBids]) => {
    const event = mockEvents.find((e) => e.id === eventId)
    return eventBids
      .filter((bid) => bid.vendorName === vendorName)
      .map((bid) => ({ ...bid, eventId, eventName: event?.name ?? "Unknown event" }))
  })

  return delay(bids)
}

const LOCAL_RENTAL_KEY = "soundscout.local_rentals"

function getLocalRentals() {
  try {
    const raw = localStorage.getItem(LOCAL_RENTAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function addInstantRental(listing) {
  const current = getLocalRentals()
  const newListing = {
    id: `local-rental-${Date.now()}`,
    ...listing,
    distanceKm: 1.5,
    availability: "now",
    rating: 5.0,
  }
  localStorage.setItem(LOCAL_RENTAL_KEY, JSON.stringify([...current, newListing]))
  return delay(newListing, 300)
}

// /inventory/instant/{region} exists but its response shape is completely
// undocumented and it supports no category filter — integrating against a
// guessed shape isn't worth it yet, so this stays fully mocked.
export async function searchInstantRentals({ category, location }) {
  if (location.trim()) {
    try {
      const dbVendors = await request(`/inventory/instant/${encodeURIComponent(location.trim())}`)
      if (Array.isArray(dbVendors) && dbVendors.length > 0) {
        return dbVendors.map((vendor) => ({
          id: `db-vendor-${vendor.vendor_id}`,
          vendorName: vendor.shop_name || "Unknown Shop",
          category: category || "Audio",
          equipmentSummary: "Full inventory rental pack & instant gear setup",
          location: vendor.region,
          distanceKm: 2.5,
          pricePerDay: 180,
          availability: "now",
          rating: 4.8,
        }))
      }
    } catch (e) {
      // Fall through to mock search if backend fails/returns 404
    }
  }

  let results = [...getLocalRentals(), ...instantRentalListings]

  if (category) {
    results = results.filter((listing) => listing.category === category)
  }
  if (location.trim()) {
    const query = location.trim().toLowerCase()
    results = results.filter((listing) => listing.location.toLowerCase().includes(query))
  }

  return delay(results, 350)
}

// No booking endpoint exists on the backend at all — stays fully mocked.
export async function bookInstantRental(listingId) {
  return delay({ listingId, status: "booked" }, 500)
}

// Real call: POST /bids. `notes` isn't in the NewBid schema, so it's kept in
// the local enrichment layer only (not sent) — same for the display-only
// vendorName/rating shown in bid comparison lists.
export async function submitBid({ eventId, vendorId, vendorName, price, notes, rating }) {
  try {
    await request("/bids", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId, vendor_id: vendorId, proposed_price: Number(price), notes }),
    })
  } catch {
    // demo event not tracked server-side, or backend unreachable — still record locally below
  }

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
