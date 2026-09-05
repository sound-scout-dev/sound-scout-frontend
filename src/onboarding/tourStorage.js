// Split out from OnboardingTour.jsx so that file exports only the component --
// mixing component and non-component exports in one file disables Fast Refresh for it.
const RESTART_EVENT = "soundscout:restart-tour"

function storageKey(tourKey) {
  return `soundscout.onboarding.${tourKey}`
}

export function hasTourRun(tourKey) {
  try {
    return localStorage.getItem(storageKey(tourKey)) === "done"
  } catch {
    // Private browsing / storage blocked -- treat as "never seen it" rather than crash.
    return false
  }
}

export function markTourDone(tourKey) {
  try {
    localStorage.setItem(storageKey(tourKey), "done")
  } catch {
    // Non-fatal: worst case the tour re-runs next visit.
  }
}

// Lets the "Take a tour" button in DashboardLayout restart whichever tour is mounted
// on the current dashboard route, without either side needing a shared store --
// only one OnboardingTour is ever mounted at a time (routes are role-exclusive).
export function restartCurrentTour() {
  window.dispatchEvent(new Event(RESTART_EVENT))
}

export function onRestartTour(handler) {
  window.addEventListener(RESTART_EVENT, handler)
  return () => window.removeEventListener(RESTART_EVENT, handler)
}
