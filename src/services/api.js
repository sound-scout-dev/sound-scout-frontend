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

export function categorizeRawItems(itemsArray) {
  const categoriesMap = {
    Audio: [],
    Lighting: [],
    Staging: [],
    Visuals: [],
    Power: []
  };

  (itemsArray || []).forEach(item => {
    let label = "";
    let qty = 1;
    if (typeof item === 'string') {
      const match = item.match(/^(\d+)x\s+(.*)$/);
      if (match) {
        qty = parseInt(match[1]);
        label = match[2];
      } else {
        label = item;
      }
    } else {
      label = item.label || "";
      qty = item.qty || 1;
    }

    const cleanLabel = label.toLowerCase();
    let targetCategory = "Audio"; // default fallback

    if (cleanLabel.includes("light") || cleanLabel.includes("par") || cleanLabel.includes("wash") || cleanLabel.includes("dmx") || cleanLabel.includes("beam") || cleanLabel.includes("uplight")) {
      targetCategory = "Lighting";
    } else if (cleanLabel.includes("stage") || cleanLabel.includes("deck") || cleanLabel.includes("truss") || cleanLabel.includes("barricade") || cleanLabel.includes("scaffold")) {
      targetCategory = "Staging";
    } else if (cleanLabel.includes("screen") || cleanLabel.includes("projector") || cleanLabel.includes("led wall") || cleanLabel.includes("tv") || cleanLabel.includes("display") || (cleanLabel.includes("monitor") && !cleanLabel.includes("stage monitor") && !cleanLabel.includes("audio monitor"))) {
      targetCategory = "Visuals";
    } else if (cleanLabel.includes("generator") || cleanLabel.includes("power") || cleanLabel.includes("distro") || cleanLabel.includes("cable run") || cleanLabel.includes("kva")) {
      targetCategory = "Power";
    }

    categoriesMap[targetCategory].push({ label, qty });
  });

  return Object.entries(categoriesMap)
    .filter(([_, items]) => items.length > 0)
    .map(([name, items]) => ({ name, items }));
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
    phone: session.user.phone,
    is_verified: session.user.is_verified,
    token: session.accessToken,
  }
}

// Real call: POST /users/register.
export async function register({ fullName, email, role, region, password, phone }) {
  const payload = { name: fullName, email, role, password, phone }
  if (role === "vendor") payload.region = region

  const created = await request("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return {
    id: created.user?.user_id,
    name: created.user?.name,
    email: created.user?.email,
    role: created.user?.role,
    region: created.user?.region,
    phone: created.user?.phone,
    is_verified: created.user?.is_verified,
    token: created.accessToken,
    verificationCode: created.verificationCode,
    botPhone: created.botPhone,
    rawResponse: created
  }
}

export async function checkVerificationStatus(verificationCode) {
  return await request(`/users/verification-status/${verificationCode}`, {
    method: "GET",
  })
}

export async function verifyOtp({ email, otp }) {
  return await request("/users/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  })
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
      let mappedBackendEvents = []
      try {
        const backendEvents = await request("/events")
        mappedBackendEvents = (backendEvents ?? []).map((e) => {
          let parsedPlan = null
          if (e.ai_infrastructure_plan) {
            parsedPlan = typeof e.ai_infrastructure_plan === 'string'
              ? JSON.parse(e.ai_infrastructure_plan)
              : e.ai_infrastructure_plan
          }

          let displayPlan;
          if (parsedPlan && parsedPlan.categories) {
            if (parsedPlan.categories.length === 1 && parsedPlan.categories[0].name === "Equipment List") {
              parsedPlan.categories = categorizeRawItems(parsedPlan.categories[0].items);
            }
            displayPlan = parsedPlan;
          } else if (parsedPlan && (parsedPlan.budget_plan || parsedPlan.premium_plan)) {
            const selectedRaw = parsedPlan.budget_plan || parsedPlan.premium_plan;
            let categories = [];
            if (Array.isArray(selectedRaw)) {
              categories = categorizeRawItems(selectedRaw);
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
            name: e.name || e.event_type, // Use custom name with fallback to event type
            eventType: e.event_type,
            crowdSize: e.crowd_count,
            date: e.event_date || e.created_at || new Date().toISOString(),
            location: e.location || "Colombo",
            status: e.status === "draft" ? "planning" : (e.status || "bidding_open"),
            plan: displayPlan,
          }
        })
      } catch (err) {
        console.error("Failed to list organizer events:", err)
      }
      
      return mappedBackendEvents
}

// Used to finalize and publish draft events from the dashboard
export async function publishEvent(eventId, selectedPlan) {
  return request(`/events/${eventId}/finalize-plan`, {
    method: "PUT",
    body: JSON.stringify({ selected_plan: selectedPlan }),
  })
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
export async function createEvent({ organizerId, name, eventType, crowdSize, venueSizeSqm, budgetRange, environment, requirements, description, location, date }) {
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
      event_date: date,
    }),
  })
}

// Real call: POST /events/{eventId}/generate-plan. This both generates the AI
// plan and opens the event for bidding on the backend in one step — there's
// no separate publish endpoint. The spec doesn't define ai_infrastructure_plan's
// shape, so the wizard keeps showing its own client-side plan preview rather
// than trusting this response's plan content.
export async function generatePlan(eventId, venue_photo_analysis) {
  return request(`/events/${eventId}/generate-plan`, {
    method: "POST",
    body: JSON.stringify({ venue_photo_analysis }),
  })
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
        name: backendEvent.name || backendEvent.event_type, // Fallback to type if name is not in schema
        eventType: backendEvent.event_type,
        crowdSize: backendEvent.crowd_count,
        venueSizeSqm: backendEvent.venue_size_sqm,
        budget: backendEvent.budget_range,
        location: backendEvent.location || backendEvent.environment || "Indoor",
        status: backendEvent.status === "draft" ? "planning" : (backendEvent.status || "bidding_open"),
        date: backendEvent.event_date || backendEvent.created_at || new Date().toISOString(), // Fallback date
        organizerName: backendEvent.organizer_name || "Organizer",
        organizerPhone: backendEvent.organizer_phone || "",
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
        if (plan.categories.length === 1 && plan.categories[0].name === "Equipment List") {
          plan.categories = categorizeRawItems(plan.categories[0].items);
        }
        displayPlan = plan;
      } else if (plan && (plan.budget_plan || plan.premium_plan)) {
        const selectedRaw = plan.budget_plan || plan.premium_plan;
        
        let categories = [];
        if (typeof selectedRaw === 'object' && !Array.isArray(selectedRaw)) {
          categories = Object.entries(selectedRaw).map(([name, items]) => {
            return {
              name,
              items: Array.isArray(items) ? items.map(item => {
                const match = item.match(/^(\d+)x\s+(.*)$/);
                if (match) {
                  return { label: match[2], qty: parseInt(match[1]) };
                }
                return { label: item, qty: 1 };
              }) : []
            };
          });
        } else if (Array.isArray(selectedRaw)) {
          categories = categorizeRawItems(selectedRaw);
        }
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
    console.error("Failed to get event by id:", err)
    return null
  }
}

// Real call: GET /bids/event/{eventId}, with a fallback to local demo bids —
// seeded mock events aren't real backend ids, so this also covers that case
// without needing to sniff id formats.
export async function listBidsForEvent(eventId) {
  try {
    const bids = await request(`/bids/event/${eventId}`)
    if (Array.isArray(bids)) {
      return bids.map((b) => ({
        id: b.bid_id,
        vendorId: b.vendor_id,
        eventId: b.event_id,
        vendorName: b.vendor_name,
        price: Number(b.proposed_price),
        notes: b.notes || "",
        status: b.status,
        rating: Number(b.rating) || 5.0,
        bid_categories: b.bid_categories || [],
        bidItems: b.bid_items || [],
        isPremium: b.is_premium || false,
        paymentStatus: b.payment_status || "unpaid",
        finalPaymentStatus: b.final_payment_status || "unpaid",
        vendorPhone: b.vendor_phone || "",
      }))
    }
  } catch (err) {
    console.error("Failed to fetch bids:", err)
  }
  return delay(mockBids[eventId] ?? [])
}

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

export async function acceptAndPayBid(bidId, transactionId) {
  return await request(`/bids/${bidId}/accept-and-pay`, {
    method: "PUT",
    body: JSON.stringify({ transactionId }),
  })
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
        if (parsedPlan.categories.length === 1 && parsedPlan.categories[0].name === "Equipment List") {
          parsedPlan.categories = categorizeRawItems(parsedPlan.categories[0].items);
        }
        displayPlan = parsedPlan;
      } else if (parsedPlan && (parsedPlan.budget_plan || parsedPlan.premium_plan)) {
        const selectedRaw = parsedPlan.budget_plan || parsedPlan.premium_plan;
        let categories = [];
        if (Array.isArray(selectedRaw)) {
          categories = categorizeRawItems(selectedRaw);
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
        name: e.name || e.event_type,
        eventType: e.event_type,
        crowdSize: e.crowd_count,
        date: e.event_date || e.created_at || new Date().toISOString(),
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

export async function listVendorBids() {
  try {
    const bids = await request("/bids/vendor")
    if (Array.isArray(bids)) {
      return bids.map((b) => ({
        id: b.bid_id,
        eventId: b.event_id,
        eventName: b.event_type ? `${b.event_type} at ${b.location}` : "Event",
        price: Number(b.proposed_price),
        status: b.status,
        notes: b.notes || "",
        bid_categories: b.bid_categories || [],
        organizerName: b.organizer_name || "Organizer",
        organizerPhone: b.organizer_phone || "",
      }))
    }
  } catch (err) {
    console.error("Failed to fetch vendor bids:", err)
  }
  return []
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
    qty: Number(listing.qty) || 1,
    distanceKm: 1.5,
    availability: "now",
    rating: 5.0,
    status: "now"
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
          
          const bookedQtys = JSON.parse(localStorage.getItem("soundscout.booked_mock_qtys") || "{}")
          const bookedQty = bookedQtys[`db-vendor-${vendor.vendor_id}`] || 0
          const initialQty = 3 // Mock initial qty for backend vendors
          const remainingQty = Math.max(0, initialQty - bookedQty)
          const isBooked = remainingQty <= 0

          return {
            id: `db-vendor-${vendor.vendor_id}`,
            vendorName: vendor.shop_name || "Unknown Shop",
            category: category || "Audio",
            equipmentSummary: "Full inventory rental pack & instant gear setup",
            location: vendor.region,
            distanceKm: distance,
            pricePerDay: 180,
            qty: remainingQty,
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
      
      const bookedQtys = JSON.parse(localStorage.getItem("soundscout.booked_mock_qtys") || "{}")
      const bookedQty = bookedQtys[listing.id] || 0
      const currentQty = Number(listing.qty) || 1
      const remainingQty = Math.max(0, currentQty - bookedQty)
      const isBooked = remainingQty <= 0 || listing.status === "booked"
      
      return { 
        ...listing, 
        distanceKm: distance,
        qty: remainingQty,
        availability: isBooked ? "booked" : "now",
        status: isBooked ? "booked" : listing.status
      }
    }))
  } else {
    // Check booked status from localStorage
    results = results.map(listing => {
      const bookedQtys = JSON.parse(localStorage.getItem("soundscout.booked_mock_qtys") || "{}")
      const bookedQty = bookedQtys[listing.id] || 0
      const currentQty = Number(listing.qty) || 1
      const remainingQty = Math.max(0, currentQty - bookedQty)
      const isBooked = remainingQty <= 0 || listing.status === "booked"
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
export async function bookInstantRental(listingId, qtyToBook = 1) {
  const current = getLocalRentals()
  const idx = current.findIndex(r => r.id === listingId)
  if (idx !== -1) {
    const listing = current[idx]
    const currentQty = Number(listing.qty) || 1
    if (currentQty > qtyToBook) {
      listing.qty = currentQty - qtyToBook
    } else {
      listing.qty = 0
      listing.status = "booked"
      listing.availability = "booked"
    }
    localStorage.setItem(LOCAL_RENTAL_KEY, JSON.stringify(current))
  } else {
    // For backend listings, we mock partial tracking by maintaining a booked count
    const bookedMockQtys = JSON.parse(localStorage.getItem("soundscout.booked_mock_qtys") || "{}")
    bookedMockQtys[listingId] = (bookedMockQtys[listingId] || 0) + qtyToBook
    localStorage.setItem("soundscout.booked_mock_qtys", JSON.stringify(bookedMockQtys))
  }
  return delay({ listingId, status: "booked" }, 500)
}

// Real call: POST /bids. `notes` isn't in the NewBid schema, so it's kept in
// the local enrichment layer only (not sent) — same for the display-only
// vendorName/rating shown in bid comparison lists.
export async function submitBid({ eventId, vendorId, vendorName, price, notes, rating, bidCategories, bidItems }) {
  try {
    await request("/bids", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId, vendor_id: vendorId, proposed_price: Number(price), notes, bid_categories: bidCategories, bid_items: bidItems }),
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
    bid_categories: bidCategories,
    bidItems: bidItems || []
  }

  if (!mockBids[eventId]) mockBids[eventId] = []
  mockBids[eventId].push(bid)

  return delay(bid)
}

export async function releaseFinalPayment(bidId, transactionId) {
  return await request(`/bids/${bidId}/final-payment`, {
    method: "PUT",
    body: JSON.stringify({ transactionId }),
  })
}

export async function submitReview({ eventId, vendorId, rating, comment }) {
  return await request(`/bids/reviews`, {
    method: "POST",
    body: JSON.stringify({ eventId, vendorId, rating, comment }),
  })
}

export async function getVendorReviews(vendorId) {
  return await request(`/bids/reviews/vendor/${vendorId}`)
}

export async function subscribePremium() {
  return await request(`/users/subscribe-premium`, {
    method: "POST"
  })
}
