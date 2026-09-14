// Tracks which (triggerType, referenceId) feedback prompts have already been shown, so a
// user isn't asked to rate SoundScout again for the same event/bid on every visit.
const STORAGE_PREFIX = "ss_feedback_asked:"

function keyFor(triggerType, referenceId) {
  return `${STORAGE_PREFIX}${triggerType}:${referenceId ?? "none"}`
}

export function hasFeedbackBeenAsked(triggerType, referenceId) {
  try {
    return localStorage.getItem(keyFor(triggerType, referenceId)) === "true"
  } catch {
    return false
  }
}

export function markFeedbackAsked(triggerType, referenceId) {
  try {
    localStorage.setItem(keyFor(triggerType, referenceId), "true")
  } catch {
    // localStorage unavailable (private browsing etc.) -- the prompt may just reappear later.
  }
}
