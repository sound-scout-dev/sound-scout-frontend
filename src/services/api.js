// Hybrid API layer: functions that have a matching endpoint in the real
// backend's OpenAPI spec call it via httpClient's `request()`. Functions for
// features with no backend support yet (or an undocumented response shape)
// stay on the mock fixtures below, clearly marked, so the app keeps working
// while the backend catches up. See the "wire what exists" plan for the
// reasoning behind each choice.

import { request, ApiError } from "./httpClient"
import {
  PLAN_TEMPLATES,
  mockEvents,
  mockBids,
  EQUIPMENT_TO_PLAN_CATEGORY,
  instantRentalListings,
} from "./mockData"

const DELAY_MS = 500
const PUBLISHED_EVENTS_KEY = "soundscout.publishedEvents"

// A stored ai_infrastructure_plan is trusted as-is when it already has a
// "categories" shape, but nothing guarantees it also carries a priceRange
// (e.g. a plan written directly to the database) — EventPlanSummary reads
// plan.priceRange.low/high unconditionally, so a missing one crashes the
// whole event detail page. Backfill it from the event's budget_range instead.
function ensurePlanPriceRange(plan, event) {
  if (!plan || plan.priceRange) return plan
  let low = 50000
  let high = 150000
  if (event?.budget_range) {
    const parts = event.budget_range.split('-')
    if (parts.length === 2) {
      low = Math.max(10000, Number(parts[0]) || low)
      high = Number(parts[1]) || high
    }
  }
  return { ...plan, priceRange: { low, high } }
}

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

  const response = await request("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  const created = response.user

  return { id: created.user_id, name: created.name, email: created.email, role: created.role, region: created.region }
}

export async function updateProfile({ name, email, region, password }) {
  const updated = await request("/users/profile", {
    method: "PUT",
    body: JSON.stringify({ name, email, region, password }),
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
        displayPlan = ensurePlanPriceRange(parsedPlan, e);
      } else if (parsedPlan && (parsedPlan.budget_plan || parsedPlan.premium_plan)) {
        const selectedRaw = parsedPlan.budget_plan || parsedPlan.premium_plan;
        let categories = [];
        if (Array.isArray(selectedRaw)) {
          categories = [
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
        } else if (typeof selectedRaw === 'object') {
          categories = Object.entries(selectedRaw).map(([name, items]) => ({
            name,
            items: Array.isArray(items) ? items.map(item => {
              const match = item.match(/^(\d+)x\s+(.*)$/);
              if (match) {
                return { label: match[2], qty: parseInt(match[1]) };
              }
              return { label: item, qty: 1 };
            }) : []
          }));
        }
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
        location: e.location || "Colombo",
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
export async function createEvent({ organizerId, name, eventType, crowdSize, venueSizeSqm, budgetRange, environment, requirements, description, location }) {
  return request("/events", {
    method: "POST",
    body: JSON.stringify({
      organizer_id: organizerId,
      name,
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
        displayPlan = ensurePlanPriceRange(plan, backendEvent);
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
    // Backend rows use bid_id/vendor_name/proposed_price and don't track a
    // vendor rating — remap to the shape BidCard expects, same as the mock data.
    if (Array.isArray(bids)) {
      return bids.map((b) => ({
        id: b.bid_id,
        vendorName: b.vendor_name,
        price: Number(b.proposed_price),
        notes: b.notes,
        status: b.status,
        rating: b.rating ?? 4.5,
        bid_categories: b.bid_categories,
      }))
    }
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
export async function listVendorOpportunities(equipmentCategory, vendorRegion) {
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
        displayPlan = ensurePlanPriceRange(parsedPlan, e);
      } else if (parsedPlan && (parsedPlan.budget_plan || parsedPlan.premium_plan)) {
        const selectedRaw = parsedPlan.budget_plan || parsedPlan.premium_plan;
        let categories = [];
        if (Array.isArray(selectedRaw)) {
          categories = [
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
        } else if (typeof selectedRaw === 'object') {
          categories = Object.entries(selectedRaw).map(([name, items]) => ({
            name,
            items: Array.isArray(items) ? items.map(item => {
              const match = item.match(/^(\d+)x\s+(.*)$/);
              if (match) {
                return { label: match[2], qty: parseInt(match[1]) };
              }
              return { label: item, qty: 1 };
            }) : []
          }));
        }
        
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
        location: e.location || "Colombo",
        district: e.district || "",
        status: "bidding_open",
        plan: displayPlan,
        existing_bids: e.existing_bids || [],
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
    .filter((event) => {
      // 0. Filter by region if specified (handles multiple comma-separated districts)
      if (vendorRegion) {
        const vendorDistricts = vendorRegion.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
        const matchesDistrict = event.district && vendorDistricts.includes(event.district.toLowerCase());
        const matchesLocation = event.location && vendorDistricts.some(d => event.location.toLowerCase().includes(d));
        if (!matchesDistrict && !matchesLocation) {
           return false;
        }
      }

      if (!neededCategory) return true;
      
      // 1. If categories contain specific category names (e.g. mock events), check that
      if (event.plan.categories.some((cat) => cat.name === neededCategory)) {
        return true;
      }
      
      // 2. If it is a flat "Equipment List" (standard for AI database events), scan items for keywords
      const eqCat = event.plan.categories.find(c => c.name === "Equipment List");
      if (eqCat) {
        const text = eqCat.items.map(it => it.label.toLowerCase()).join(" ");
        if (neededCategory === "Audio") {
          return text.includes("speaker") || text.includes("mixer") || text.includes("mic") || text.includes("subwoofer") || text.includes("pa system") || text.includes("audio") || text.includes("line array") || text.includes("amplifier") || text.includes("sound") || text.includes("hazer") || text.includes("wireless");
        }
        if (neededCategory === "Lighting") {
          return text.includes("light") || text.includes("led") || text.includes("par") || text.includes("head") || text.includes("hazer") || text.includes("laser") || text.includes("lighting") || text.includes("spot");
        }
        if (neededCategory === "Staging") {
          return text.includes("stage") || text.includes("deck") || text.includes("truss") || text.includes("rigging") || text.includes("ground support");
        }
        if (neededCategory === "Power") {
          return text.includes("generator") || text.includes("kva") || text.includes("power") || text.includes("silent") || text.includes("cabling");
        }
      }
      return false;
    })

  return delay(opportunities)
}

// No backend endpoint for a vendor's own bid history — stays fully mocked.
export async function listVendorBids(vendorName) {
  let realBids = []
  try {
    const bids = await request("/bids/vendor")
    realBids = (bids ?? []).map((b) => ({
      id: b.bid_id,
      eventId: b.event_id,
      eventName: b.event_type,
      price: Number(b.proposed_price),
      notes: b.notes,
      status: b.status,
      bid_categories: b.bid_categories,
    }))
  } catch {
    // backend unreachable — fall through to local mock bids only
  }

  const mockedBids = Object.entries(mockBids).flatMap(([eventId, eventBids]) => {
    const event = mockEvents.find((e) => e.id === eventId)
    return eventBids
      .filter((bid) => bid.vendorName === vendorName)
      .map((bid) => ({ ...bid, eventId, eventName: event?.name ?? "Unknown event" }))
  })

  return delay([...realBids, ...mockedBids])
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
  let dbResults = []
  if (location.trim()) {
    try {
      const dbVendors = await request(`/inventory/instant/${encodeURIComponent(location.trim())}`)
      if (Array.isArray(dbVendors) && dbVendors.length > 0) {
        dbResults = await Promise.all(dbVendors.map(async (vendor) => {
          let distance = 2.5;
          try {
            const aiRes = await fetch("http://localhost:8000/api/distance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ venue: location, vendor_region: vendor.region })
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              distance = aiData.distance_km;
            }
          } catch (e) {
             console.error("AI Distance Fetch failed, using fallback:", e);
          }
          
          const bookedMockIds = JSON.parse(localStorage.getItem("soundscout.booked_mock_ids") || "[]")
          const isBooked = bookedMockIds.includes(`db-vendor-${vendor.vendor_id}`)

          return {
            id: `db-vendor-${vendor.vendor_id}`,
            vendorName: vendor.shop_name || "Unknown Shop",
            category: category || "Audio",
            equipmentSummary: "Full inventory rental pack & instant gear setup",
            location: vendor.region,
            distanceKm: distance,
            pricePerDay: 180,
            availability: isBooked ? "booked" : "now",
            status: isBooked ? "booked" : "now",
            rating: 4.8,
          }
        }))
      }
    } catch (e) {
      // Fall through to mock search if backend fails/returns 404
    }
  }

  let results = [...getLocalRentals(), ...instantRentalListings]

  // Resolve distance dynamically using AI distance model if location query is present
  if (location.trim()) {
    results = await Promise.all(results.map(async (listing) => {
      let distance = listing.distanceKm;
      try {
        const aiRes = await fetch("http://localhost:8000/api/distance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venue: location, vendor_region: listing.location })
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          distance = aiData.distance_km;
        }
      } catch (e) {
        // keep original mock distance
      }
      
      const bookedMockIds = JSON.parse(localStorage.getItem("soundscout.booked_mock_ids") || "[]")
      const isBooked = bookedMockIds.includes(listing.id) || listing.status === "booked"

      return { 
        ...listing, 
        distanceKm: distance,
        status: isBooked ? "booked" : listing.status,
        availability: isBooked ? "booked" : listing.availability
      }
    }))
  } else {
    // Check booked status from localStorage
    results = results.map(listing => {
      const bookedMockIds = JSON.parse(localStorage.getItem("soundscout.booked_mock_ids") || "[]")
      const isBooked = bookedMockIds.includes(listing.id) || listing.status === "booked"
      return {
        ...listing,
        status: isBooked ? "booked" : listing.status,
        availability: isBooked ? "booked" : listing.availability
      }
    })
  }

  if (category) {
    results = results.filter((listing) => listing.category === category)
  }
  
  if (dbResults.length > 0) {
    return [...dbResults, ...results]
  }

  return delay(results, 350)
}

// No booking endpoint exists on the backend at all — stays fully mocked in localStorage.
export async function bookInstantRental(listingId) {
  const current = getLocalRentals()
  const idx = current.findIndex(r => r.id === listingId)
  if (idx !== -1) {
    current[idx].status = "booked"
    localStorage.setItem(LOCAL_RENTAL_KEY, JSON.stringify(current))
  } else {
    const bookedMockIds = JSON.parse(localStorage.getItem("soundscout.booked_mock_ids") || "[]")
    bookedMockIds.push(listingId)
    localStorage.setItem("soundscout.booked_mock_ids", JSON.stringify(bookedMockIds))
  }
  return delay({ listingId, status: "booked" }, 500)
}

// Real call: POST /bids. `notes` isn't in the NewBid schema, so it's kept in
// the local enrichment layer only (not sent) — same for the display-only
// vendorName/rating shown in bid comparison lists.
export async function submitBid({ eventId, vendorId, vendorName, price, notes, rating, bidCategories }) {
  try {
    await request("/bids", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId, vendor_id: vendorId, proposed_price: Number(price), notes, bid_categories: bidCategories }),
    })
  } catch (err) {
    // A real event rejected the bid on business-rule grounds (e.g. this vendor
    // already bid on it) — surface that instead of silently faking success.
    if (err instanceof ApiError && err.status === 409) {
      throw err
    }
    // Otherwise: demo event not tracked server-side, or backend unreachable —
    // still record locally below so the demo experience keeps working.
  }

  const bid = {
    id: `bid-${Date.now()}`,
    vendorName,
    price: Number(price),
    notes,
    rating,
    status: "pending",
    bid_categories: bidCategories,
  }

  if (!mockBids[eventId]) mockBids[eventId] = []
  mockBids[eventId].push(bid)

  return delay(bid)
}
