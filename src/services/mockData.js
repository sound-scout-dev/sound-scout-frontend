// Placeholder fixtures — swap for real API responses when the backend is ready.

export const heroPlan = {
  eventType: "Outdoor Music Festival",
  meta: "2,500 guests · Riverside Park",
  categories: [
    {
      name: "Audio",
      items: [
        { label: "Line array speakers (L-Acoustics K2 or equiv.)", qty: "12x" },
        { label: "Subwoofers", qty: "8x" },
        { label: "Digital mixing console", qty: "1x" },
        { label: "Stage monitors", qty: "6x" },
      ],
    },
    {
      name: "Lighting",
      items: [
        { label: "Moving head fixtures", qty: "24x" },
        { label: "LED wash bars", qty: "16x" },
        { label: "Lighting console + DMX rig", qty: "1x" },
      ],
    },
    {
      name: "Staging",
      items: [
        { label: "Main stage deck (12m x 8m)", qty: "1x" },
        { label: "Truss roof system", qty: "1x" },
        { label: "Barricade sections", qty: "40x" },
      ],
    },
    {
      name: "Power",
      items: [
        { label: "Generator (150kVA, silenced)", qty: "2x" },
        { label: "Distro + cable runs", qty: "1x" },
      ],
    },
  ],
  priceRange: { low: 18400, high: 24900 },
}

export const EVENT_TYPES = [
  "Music Festival",
  "Wedding",
  "Corporate Conference",
  "Private Party",
  "Other",
]

// Quantities are keyed by crowd-size tier: [small, medium, large]
export const PLAN_TEMPLATES = {
  "Music Festival": {
    Audio: [
      { label: "Line array speakers", qty: ["4x", "8x", "16x"] },
      { label: "Subwoofers", qty: ["2x", "4x", "10x"] },
      { label: "Digital mixing console", qty: ["1x", "1x", "2x"] },
      { label: "Stage monitors", qty: ["2x", "4x", "8x"] },
    ],
    Lighting: [
      { label: "Moving head fixtures", qty: ["6x", "12x", "28x"] },
      { label: "LED wash bars", qty: ["4x", "10x", "20x"] },
      { label: "Lighting console + DMX rig", qty: ["1x", "1x", "1x"] },
    ],
    Staging: [
      { label: "Main stage deck", qty: ["1x (6m x 4m)", "1x (10m x 6m)", "1x (16m x 10m)"] },
      { label: "Truss roof system", qty: ["1x", "1x", "2x"] },
      { label: "Barricade sections", qty: ["10x", "24x", "50x"] },
    ],
    Power: [
      { label: "Generator (silenced)", qty: ["1x (60kVA)", "1x (100kVA)", "2x (150kVA)"] },
      { label: "Distro + cable runs", qty: ["1x", "1x", "2x"] },
    ],
  },
  Wedding: {
    Audio: [
      { label: "PA speaker system", qty: ["2x", "4x", "6x"] },
      { label: "Wireless microphone system", qty: ["1x", "2x", "2x"] },
      { label: "DJ / ceremony mixing setup", qty: ["1x", "1x", "1x"] },
    ],
    Lighting: [
      { label: "Uplighting fixtures", qty: ["8x", "16x", "24x"] },
      { label: "String / fairy lighting (runs)", qty: ["4x", "8x", "12x"] },
      { label: "Dance floor lighting rig", qty: ["1x", "1x", "2x"] },
    ],
    Staging: [
      { label: "Ceremony / dance platform", qty: ["1x (3m x 3m)", "1x (4m x 4m)", "1x (6m x 6m)"] },
    ],
    Power: [
      { label: "Power distribution unit", qty: ["1x", "1x", "2x"] },
      { label: "Backup generator", qty: ["-", "1x", "1x"] },
    ],
  },
  "Corporate Conference": {
    Audio: [
      { label: "Point-source speaker system", qty: ["2x", "6x", "12x"] },
      { label: "Lapel / handheld mic sets", qty: ["2x", "4x", "8x"] },
      { label: "Conference mixing console", qty: ["1x", "1x", "1x"] },
    ],
    Lighting: [
      { label: "Stage wash lighting", qty: ["4x", "8x", "16x"] },
      { label: "Podium / presentation lighting", qty: ["2x", "2x", "4x"] },
    ],
    Staging: [
      { label: "Presentation stage/platform", qty: ["1x (4m x 3m)", "1x (8m x 5m)", "1x (12m x 6m)"] },
      { label: "Lectern", qty: ["1x", "1x", "2x"] },
    ],
    Power: [
      { label: "Power distribution + UPS backup", qty: ["1x", "1x", "2x"] },
    ],
  },
  "Private Party": {
    Audio: [
      { label: "PA speaker system", qty: ["2x", "4x", "6x"] },
      { label: "Wireless microphone", qty: ["1x", "1x", "2x"] },
      { label: "DJ setup", qty: ["1x", "1x", "1x"] },
    ],
    Lighting: [
      { label: "Uplighting fixtures", qty: ["4x", "10x", "16x"] },
      { label: "Dance floor lighting", qty: ["1x", "1x", "2x"] },
    ],
    Staging: [
      { label: "Small platform", qty: ["-", "1x (3m x 3m)", "1x (4m x 4m)"] },
    ],
    Power: [
      { label: "Power distribution unit", qty: ["1x", "1x", "1x"] },
    ],
  },
  Other: {
    Audio: [
      { label: "PA speaker system", qty: ["2x", "4x", "8x"] },
      { label: "Microphone set", qty: ["1x", "2x", "4x"] },
      { label: "Mixing console", qty: ["1x", "1x", "1x"] },
    ],
    Lighting: [
      { label: "General wash lighting", qty: ["4x", "8x", "16x"] },
    ],
    Staging: [
      { label: "Platform / stage", qty: ["1x (3m x 3m)", "1x (6m x 4m)", "1x (10m x 6m)"] },
    ],
    Power: [
      { label: "Power distribution unit", qty: ["1x", "1x", "2x"] },
    ],
  },
}

export const mockEvents = [
  {
    id: "evt-1",
    name: "Riverside Summer Fest",
    eventType: "Music Festival",
    date: "2026-08-14",
    crowdSize: 2200,
    location: "Riverside Park",
    status: "bidding_open",
  },
  {
    id: "evt-2",
    name: "Chen & Alvarez Wedding",
    eventType: "Wedding",
    date: "2026-07-25",
    crowdSize: 140,
    location: "Grandview Estate",
    status: "booked",
  },
  {
    id: "evt-3",
    name: "Northbridge Product Summit",
    eventType: "Corporate Conference",
    date: "2026-09-02",
    crowdSize: 650,
    location: "Northbridge Convention Center",
    status: "planning",
  },
]
