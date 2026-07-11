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
