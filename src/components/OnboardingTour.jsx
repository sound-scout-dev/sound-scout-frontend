import { useCallback, useEffect, useState } from "react"
import { Joyride, STATUS } from "react-joyride"
import { hasTourRun, markTourDone, onRestartTour } from "../onboarding/tourStorage"

// tourKey: stable id for this tour's "seen it" flag, e.g. "organizer-dashboard".
// steps: react-joyride step definitions, see src/onboarding/tourSteps.js.
function OnboardingTour({ tourKey, steps }) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    if (hasTourRun(tourKey)) return
    // Give the dashboard's own data fetch + skeleton-to-content swap a moment to
    // settle first, so Joyride measures the real target elements, not placeholders.
    const timer = setTimeout(() => setRun(true), 600)
    return () => clearTimeout(timer)
  }, [tourKey])

  useEffect(() => onRestartTour(() => setRun(true)), [])

  // react-joyride v3 replaced the old `callback` prop with `onEvent`; `status` is
  // still carried on every event's data (TourData.status), so this is unchanged
  // in spirit from the v2 callback check.
  const handleEvent = useCallback((data) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false)
      markTourDone(tourKey)
    }
  }, [tourKey])

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      locale={{ back: "Back", close: "Close", last: "Done", next: "Next", skip: "Skip" }}
      options={{
        primaryColor: "#0891B2",
        textColor: "#0F172A",
        arrowColor: "#ffffff",
        zIndex: 10000,
        showProgress: true,
        buttons: ["back", "close", "primary", "skip"],
      }}
      styles={{
        tooltip: { borderRadius: 10, fontFamily: "inherit" },
        buttonPrimary: { borderRadius: 6, fontWeight: 600 },
        buttonBack: { fontWeight: 600 },
      }}
    />
  )
}

export default OnboardingTour
