// ============================================================
// EventScout AI — API Service Layer
// All data access goes through this file.
// Currently uses mock data. When ready, swap the function bodies
// to fetch from your real backend API — no other files need to change.
// ============================================================

import {
  mockEvents,
  mockBids,
  mockUsers,
  mockVendorOpenEvents,
  mockVendorBids,
} from '../data/mockData';

const API_BASE = '/api'; // Change to your real API base URL

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Auth ──────────────────────────────────────────────────────

export async function login(email, password) {
  await delay(800);
  // Mock: any email/password works
  if (!email || !password) throw new Error('Email and password are required.');
  const role = email.includes('vendor') ? 'vendor' : 'organizer';
  return { user: mockUsers[role], token: 'mock-jwt-token-' + Date.now() };
}

export async function register({ name, email, password, role }) {
  await delay(800);
  if (!name || !email || !password || !role)
    throw new Error('All fields are required.');
  return {
    user: { id: 'usr_new_' + Date.now(), name, email, role },
    token: 'mock-jwt-token-' + Date.now(),
  };
}

// ── Organizer: Events ─────────────────────────────────────────

export async function getEvents() {
  await delay(400);
  return [...mockEvents];
}

export async function getEventById(eventId) {
  await delay(300);
  const event = mockEvents.find((e) => e.id === eventId);
  if (!event) throw new Error('Event not found.');
  return { ...event };
}

export async function createEvent(eventData) {
  await delay(600);
  const newEvent = {
    id: 'evt_' + Date.now(),
    organizerId: 'usr_001',
    ...eventData,
    status: 'Planning',
    createdAt: new Date().toISOString(),
    plan: null,
  };
  return newEvent;
}

// ── AI Plan Generation ────────────────────────────────────────

export async function generatePlan(eventData) {
  // Simulates AI processing time
  await delay(2500);

  const equipmentMap = {
    Concert: [
      { name: 'Main Stage PA System', spec: 'Line array · 16×tops + 12×subs', qty: 1, unit: 'set', estimatedCost: 9500 },
      { name: 'Stage Lighting Rig', spec: 'Moving heads + wash · 56 fixtures', qty: 1, unit: 'set', estimatedCost: 7200 },
      { name: 'LED Video Wall', spec: 'P3.9 outdoor · 5m × 3m', qty: 2, unit: 'panel set', estimatedCost: 8000 },
      { name: 'FOH Console', spec: 'Digital · 64 channels', qty: 1, unit: 'unit', estimatedCost: 2500 },
      { name: 'Monitor System', spec: 'Wedges + IEM transmitters', qty: 1, unit: 'set', estimatedCost: 3200 },
      { name: 'Staging', spec: '14m × 10m with roof', qty: 1, unit: 'set', estimatedCost: 6500 },
      { name: 'Power Distribution', spec: '400A 3-phase + distro', qty: 1, unit: 'set', estimatedCost: 3000 },
      { name: 'Crowd Barriers', spec: 'Steel · 1.2m height', qty: 100, unit: 'units', estimatedCost: 2500 },
    ],
    Conference: [
      { name: 'Main Stage PA', spec: 'Column array · 4×tops + 2×subs', qty: 1, unit: 'set', estimatedCost: 4200 },
      { name: 'Stage Lighting', spec: 'LED wash + spot · 32 fixtures', qty: 1, unit: 'set', estimatedCost: 3800 },
      { name: 'LED Screen', spec: 'P2.6 indoor · 4m × 2.5m', qty: 1, unit: 'panel set', estimatedCost: 4500 },
      { name: 'Wireless Mics', spec: 'UHF handheld + lavalier', qty: 6, unit: 'units', estimatedCost: 1800 },
      { name: 'Breakout AV Package', spec: 'Projector + screen + mic', qty: 3, unit: 'sets', estimatedCost: 3600 },
      { name: 'Live Stream Kit', spec: '2-camera + encoder', qty: 1, unit: 'set', estimatedCost: 2800 },
      { name: 'Staging', spec: '10m × 6m stage + risers', qty: 1, unit: 'set', estimatedCost: 3200 },
    ],
    Wedding: [
      { name: 'Sound System', spec: 'Column array · 4×tops + 2×subs', qty: 1, unit: 'set', estimatedCost: 3200 },
      { name: 'DJ Setup', spec: 'CDJ + mixer + monitor', qty: 1, unit: 'set', estimatedCost: 1500 },
      { name: 'Ambient Lighting', spec: 'Fairy lights + uplighters', qty: 1, unit: 'set', estimatedCost: 2800 },
      { name: 'Stage Lighting', spec: 'LED par cans · 16 fixtures', qty: 1, unit: 'set', estimatedCost: 1800 },
      { name: 'Performance Stage', spec: '6m × 4m carpeted', qty: 1, unit: 'set', estimatedCost: 2000 },
      { name: 'Wireless Mics', spec: 'Handheld + headset', qty: 4, unit: 'units', estimatedCost: 800 },
    ],
    Festival: [
      { name: 'Main Stage PA', spec: 'Line array · 24×tops + 16×subs', qty: 1, unit: 'set', estimatedCost: 12000 },
      { name: 'Second Stage PA', spec: 'Line array · 12×tops + 8×subs', qty: 1, unit: 'set', estimatedCost: 7000 },
      { name: 'Lighting Rig', spec: 'Moving heads · 80 fixtures', qty: 2, unit: 'sets', estimatedCost: 14000 },
      { name: 'LED Screens', spec: 'P3.9 outdoor · 6m × 4m', qty: 4, unit: 'panels', estimatedCost: 16000 },
      { name: 'Generators', spec: '500 kVA silent diesel', qty: 3, unit: 'units', estimatedCost: 6000 },
      { name: 'Staging', spec: '16m × 12m + 10m × 8m', qty: 2, unit: 'sets', estimatedCost: 12000 },
      { name: 'Crowd Barriers', spec: 'Steel · 1.2m height', qty: 300, unit: 'units', estimatedCost: 6000 },
    ],
    Corporate: [
      { name: 'AV System', spec: 'Compact array + projector', qty: 1, unit: 'set', estimatedCost: 3500 },
      { name: 'Presentation Screen', spec: 'P2.6 LED · 3m × 2m', qty: 1, unit: 'panel set', estimatedCost: 3000 },
      { name: 'Wireless Mics', spec: 'UHF lavalier', qty: 4, unit: 'units', estimatedCost: 1200 },
      { name: 'Stage Lighting', spec: 'LED wash · 16 fixtures', qty: 1, unit: 'set', estimatedCost: 2000 },
      { name: 'Staging', spec: '8m × 5m with lectern', qty: 1, unit: 'set', estimatedCost: 2500 },
    ],
    Sports: [
      { name: 'PA System', spec: 'Distributed · 8 zones', qty: 1, unit: 'set', estimatedCost: 6500 },
      { name: 'Scoreboard Display', spec: 'P4 outdoor · 4m × 2m', qty: 2, unit: 'panels', estimatedCost: 5000 },
      { name: 'Field Lighting', spec: 'LED floodlights · 8 units', qty: 1, unit: 'set', estimatedCost: 8000 },
      { name: 'Commentary Position', spec: 'Desk + mics + mixer', qty: 1, unit: 'set', estimatedCost: 1500 },
      { name: 'Power Distribution', spec: '200A 3-phase', qty: 1, unit: 'set', estimatedCost: 2200 },
    ],
  };

  const equipment = equipmentMap[eventData.type] || equipmentMap.Corporate;
  const totalBase = equipment.reduce((sum, e) => sum + e.estimatedCost, 0);

  return {
    id: 'plan_' + Date.now(),
    generatedAt: new Date().toISOString(),
    equipment,
    estimatedTotal: {
      min: Math.round(totalBase * 0.9),
      max: Math.round(totalBase * 1.2),
    },
    notes: `AI-generated plan for ${eventData.type} event with ${eventData.crowdSize} attendees. Includes setup, operation, and teardown. Subject to vendor pricing.`,
  };
}

// ── Organizer: Publish Plan ────────────────────────────────────

export async function publishPlan(eventId) {
  await delay(600);
  return { success: true, status: 'Bidding Open' };
}

// ── Bids ──────────────────────────────────────────────────────

export async function getBidsForEvent(eventId) {
  await delay(400);
  return mockBids.filter((b) => b.eventId === eventId);
}

export async function submitBid({ eventId, price, notes }) {
  await delay(600);
  return {
    id: 'bid_' + Date.now(),
    eventId,
    vendorId: 'usr_002',
    vendorName: 'SoundPro Audio',
    vendorCompany: 'SoundPro Audio Solutions',
    price,
    notes,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  };
}

export async function acceptBid(bidId) {
  await delay(500);
  return { success: true, bidId, status: 'Accepted' };
}

// ── Vendor ────────────────────────────────────────────────────

export async function getVendorOpenEvents() {
  await delay(400);
  return [...mockVendorOpenEvents];
}

export async function getVendorBids() {
  await delay(400);
  return [...mockVendorBids];
}
