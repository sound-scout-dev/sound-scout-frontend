// Step definitions for the automated onboarding tours (react-joyride). Targets are
// matched by the `data-tour` attributes added to OrganizerDashboard.jsx,
// VendorDashboard.jsx, and DashboardLayout.jsx.

export const organizerDashboardSteps = [
  {
    target: '[data-tour="new-event-button"]',
    content: "Start here. Create a new event and the AI consultant drafts a full infrastructure plan for it in seconds.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="events-list"]',
    content: "Every event you create shows up here as a card, tracking its status from first draft through to a fully booked vendor.",
  },
  {
    target: '[data-tour="nav-profile"]',
    content: "Keep your contact details and region up to date here — vendors and the AI planner both use this.",
  },
]

export const vendorDashboardSteps = [
  {
    target: '[data-tour="open-opportunities"]',
    content: "Events matching your equipment category and district land here automatically — no searching required.",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="my-bids"]',
    content: "Track every bid you've placed and its status. Once an organizer accepts, a WhatsApp chat link unlocks right here.",
  },
  {
    target: '[data-tour="premium-card"]',
    content: "Upgrade to Premium for a verified badge and top placement in every organizer's matching list.",
  },
  {
    target: '[data-tour="list-rental-form"]',
    content: "List spare gear here for instant booking — organizers can rent it immediately, no bidding required.",
  },
  {
    target: '[data-tour="nav-profile"]',
    content: "Manage your business details and region here — this determines which events show up as opportunities.",
  },
]
