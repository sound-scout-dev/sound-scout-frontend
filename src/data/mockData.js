// ============================================================
// EventScout AI — Mock Data
// All placeholder data lives here. Replace with real API later.
// ============================================================

export const mockUsers = {
  organizer: {
    id: 'usr_001',
    name: 'Sarah Chen',
    email: 'sarah@eventscout.ai',
    role: 'organizer',
    avatar: null,
  },
  vendor: {
    id: 'usr_002',
    name: 'Marcus Rivera',
    email: 'marcus@soundpro.com',
    role: 'vendor',
    company: 'SoundPro Audio',
    category: 'Sound & Audio',
    avatar: null,
  },
};

export const mockEvents = [
  {
    id: 'evt_001',
    organizerId: 'usr_001',
    name: 'TechCon 2026 — Annual Developer Conference',
    type: 'Conference',
    crowdSize: 2500,
    venueDimensions: '80m × 50m indoor hall',
    budgetMin: 45000,
    budgetMax: 65000,
    location: 'Bangalore, India',
    description: 'Annual developer conference with keynote stage, 4 breakout rooms, networking area, and exhibition space. Need full AV setup with live streaming capability.',
    status: 'Bidding Open',
    createdAt: '2026-07-08T10:30:00Z',
    plan: {
      id: 'plan_001',
      generatedAt: '2026-07-08T10:32:00Z',
      equipment: [
        { name: 'Main Stage PA System', spec: 'Line array, 12×tops + 8×subs', qty: 1, unit: 'set', estimatedCost: 8500 },
        { name: 'Stage Lighting Rig', spec: 'LED wash + spot, 48 fixtures', qty: 1, unit: 'set', estimatedCost: 6200 },
        { name: 'LED Video Wall', spec: 'P2.6 indoor, 4.8m × 2.7m', qty: 2, unit: 'panel set', estimatedCost: 7400 },
        { name: 'Wireless Microphone System', spec: 'UHF, handheld + lavalier', qty: 8, unit: 'units', estimatedCost: 2400 },
        { name: 'Breakout Room AV Package', spec: 'Projector + screen + mic', qty: 4, unit: 'sets', estimatedCost: 4800 },
        { name: 'Live Streaming Kit', spec: '3-camera + encoder + switcher', qty: 1, unit: 'set', estimatedCost: 3500 },
        { name: 'Power Distribution', spec: '200A 3-phase + distro boards', qty: 1, unit: 'set', estimatedCost: 2200 },
        { name: 'Staging & Risers', spec: '12m × 8m main stage + risers', qty: 1, unit: 'set', estimatedCost: 4500 },
        { name: 'Crowd Barriers', spec: 'Aluminium, 1.2m height', qty: 60, unit: 'units', estimatedCost: 1800 },
      ],
      estimatedTotal: { min: 38800, max: 52000 },
      notes: 'Includes setup, operation for 2 days, and teardown. Excludes generator rental if venue power is insufficient.',
    },
  },
  {
    id: 'evt_002',
    organizerId: 'usr_001',
    name: 'Priya & Arjun — Garden Wedding Reception',
    type: 'Wedding',
    crowdSize: 350,
    venueDimensions: '40m × 30m outdoor garden',
    budgetMin: 15000,
    budgetMax: 25000,
    location: 'Jaipur, India',
    description: 'Elegant outdoor garden wedding reception. Need ambient lighting, sound system for ceremony + DJ, and a small stage for performances.',
    status: 'Booked',
    createdAt: '2026-06-20T14:00:00Z',
    plan: {
      id: 'plan_002',
      generatedAt: '2026-06-20T14:03:00Z',
      equipment: [
        { name: 'Sound System', spec: 'Column array, 4×tops + 2×subs', qty: 1, unit: 'set', estimatedCost: 3200 },
        { name: 'DJ Console Setup', spec: 'CDJ + mixer + monitor', qty: 1, unit: 'set', estimatedCost: 1500 },
        { name: 'Ambient Lighting', spec: 'Fairy lights + uplighters, warm white', qty: 1, unit: 'set', estimatedCost: 2800 },
        { name: 'Stage Spot Lighting', spec: 'LED par cans, 16 fixtures', qty: 1, unit: 'set', estimatedCost: 1800 },
        { name: 'Performance Stage', spec: '6m × 4m carpeted stage', qty: 1, unit: 'set', estimatedCost: 2000 },
        { name: 'Wireless Microphones', spec: 'Handheld + headset', qty: 4, unit: 'units', estimatedCost: 800 },
        { name: 'Generator', spec: '125 kVA silent diesel', qty: 1, unit: 'unit', estimatedCost: 1500 },
      ],
      estimatedTotal: { min: 12500, max: 18000 },
      notes: 'Outdoor setup. Generator recommended for reliable power. Includes weatherproofing covers.',
    },
  },
  {
    id: 'evt_003',
    organizerId: 'usr_001',
    name: 'Startup Pitch Day — Q3',
    type: 'Corporate',
    crowdSize: 150,
    venueDimensions: '20m × 15m conference room',
    budgetMin: 5000,
    budgetMax: 10000,
    location: 'Mumbai, India',
    description: 'Startup pitch event with presentation stage, investor seating, and networking area.',
    status: 'Planning',
    createdAt: '2026-07-10T09:00:00Z',
    plan: null,
  },
];

export const mockBids = [
  {
    id: 'bid_001',
    eventId: 'evt_001',
    vendorId: 'usr_002',
    vendorName: 'SoundPro Audio',
    vendorCompany: 'SoundPro Audio Solutions',
    price: 48500,
    notes: 'Full package including 2-day operation crew (6 technicians). We can provide JBL VTX line arrays for superior coverage. 10% discount for booking before July 15.',
    status: 'Pending',
    submittedAt: '2026-07-09T08:00:00Z',
  },
  {
    id: 'bid_002',
    eventId: 'evt_001',
    vendorId: 'usr_003',
    vendorName: 'EventTech Solutions',
    vendorCompany: 'EventTech Solutions Pvt Ltd',
    price: 52000,
    notes: 'Premium package with d&b audiotechnik system. Includes backup equipment and dedicated project manager. Price includes transport from Delhi.',
    status: 'Pending',
    submittedAt: '2026-07-09T11:30:00Z',
  },
  {
    id: 'bid_003',
    eventId: 'evt_001',
    vendorId: 'usr_004',
    vendorName: 'LightWave Productions',
    vendorCompany: 'LightWave Productions',
    price: 44200,
    notes: 'Competitive pricing for complete AV package. We specialize in conference setups. Includes rehearsal day at no extra cost.',
    status: 'Pending',
    submittedAt: '2026-07-09T15:45:00Z',
  },
  {
    id: 'bid_004',
    eventId: 'evt_002',
    vendorId: 'usr_002',
    vendorName: 'SoundPro Audio',
    vendorCompany: 'SoundPro Audio Solutions',
    price: 16800,
    notes: 'Beautiful outdoor wedding setup. We have extensive experience with garden venues in Jaipur.',
    status: 'Accepted',
    submittedAt: '2026-06-22T10:00:00Z',
  },
];

// Events visible to vendors (open for bidding)
export const mockVendorOpenEvents = [
  mockEvents[0], // TechCon — Bidding Open
];

// Vendor's own bids
export const mockVendorBids = [
  mockBids[0], // Bid on TechCon
  mockBids[3], // Accepted bid on Wedding
];

// Hero spec card demo data (for landing page animation)
export const heroSpecCardData = {
  eventType: 'Music Festival',
  crowdSize: '5,000',
  equipment: [
    { name: 'Main Stage PA', spec: 'Line array · 24×tops + 16×subs', qty: 1, unit: 'set' },
    { name: 'Stage Lighting', spec: 'Moving heads · 64 fixtures', qty: 1, unit: 'set' },
    { name: 'LED Screens', spec: 'P3.9 outdoor · 6m × 4m', qty: 3, unit: 'panels' },
    { name: 'Generators', spec: '500 kVA · silent diesel', qty: 2, unit: 'units' },
    { name: 'Crowd Barriers', spec: 'Steel · 1.2m height', qty: 200, unit: 'units' },
    { name: 'FOH / Monitor Consoles', spec: 'Digital · 64ch + 48ch', qty: 2, unit: 'units' },
  ],
  estimatedRange: '₹18,50,000 — ₹24,00,000',
};
