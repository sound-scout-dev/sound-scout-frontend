// placement/acoustics.js
//
// Delay/coverage math for the Premium Venue Blueprint. Ported from the
// standalone planner app, with two corrections noted at DELAY RING SPACING
// and isPointInPolygon below.
//
// Units: every function here works in METERS unless a name ends in Px.
// Pixel<->meter conversion is the caller's job (see venueFrame.js).

export const DEFAULT_TEMPERATURE_C = 29 // outdoor Sri Lanka, not the 20C lab default

// Free-field SPL drops 20*log10(2) ~= 6.02 dB per doubling of distance.
export const SIX_DB_DOUBLING_RATIO = 2

// A competent main hang holds level at least this far even if the crowd
// starts closer, so a front rail against the stage doesn't produce a string
// of unrealistically tight delay rings.
export const MIN_MAIN_THROW_M = 20

// Practical band for delay ring spacing on festival-scale outdoor PA.
export const MIN_RING_SPACING_M = 25
export const MAX_RING_SPACING_M = 45

export const MAX_STEREO_PAIR_COVERAGE_DEG = 140
export const MAIN_PA_STANDOFF_M = 5
export const DEFAULT_STAGE_SPAN_FALLBACK_M = 8
export const MIN_MARGIN_TO_BACK_OF_CROWD_M = 5
export const MAX_DELAY_TOWERS = 6

/** Speed of sound in dry air: v = 331.3 + 0.606 * T(C). */
export function speedOfSoundMs(temperatureCelsius = DEFAULT_TEMPERATURE_C) {
  return 331.3 + 0.606 * temperatureCelsius
}

export function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function unitVector(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  if (len === 0) return { x: 1, y: 0 }
  return { x: dx / len, y: dy / len }
}

export function perpendicular(v) {
  return { x: -v.y, y: v.x }
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y
}

export function computeCentroid(points) {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: sum.x / points.length, y: sum.y / points.length }
}

/**
 * Ray-casting point-in-polygon. The standalone app's README claimed delay
 * towers were only placed inside the drawn crowd area, but no such test
 * existed -- on an L-shaped or angled crowd a tower could land in a car park.
 * O(v) in the polygon's vertex count.
 */
export function isPointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersects = yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

/** Inverse-square SPL change in dB at `distanceM` relative to `referenceM`. */
export function splDeltaDb(distanceM, referenceM) {
  if (!referenceM || referenceM <= 0 || !distanceM || distanceM <= 0) return 0
  return -20 * Math.log10(distanceM / referenceM)
}

/**
 * Delay for a tower sitting `distanceM` downrange of the main PA.
 * base = (distance / speed) * 1000; recommended adds a 15ms Haas offset so
 * the main arrives first and the image stays locked to the stage.
 */
export function computeDelay(distanceM, temperatureCelsius = DEFAULT_TEMPERATURE_C, referenceM = null) {
  const speed = speedOfSoundMs(temperatureCelsius)
  const baseDelayMs = (distanceM / speed) * 1000
  const haasOffsetMs = 15
  const recommendedDelayMs = baseDelayMs + haasOffsetMs
  const splDrop = referenceM ? splDeltaDb(distanceM, referenceM) : null

  return {
    distanceM,
    speedOfSoundMs: speed,
    baseDelayMs,
    haasOffsetMs,
    recommendedDelayMs,
    splDeltaDb: splDrop,
    formula: {
      baseDelay: `${baseDelayMs.toFixed(1)}ms = (${distanceM.toFixed(1)}m / ${speed.toFixed(1)}m/s) x 1000`,
      recommended: `${recommendedDelayMs.toFixed(1)}ms = ${baseDelayMs.toFixed(1)}ms + 15ms (Haas offset)`,
      spl: splDrop !== null ? `${splDrop.toFixed(1)} dB = -20*log10(${distanceM.toFixed(1)}m / ${referenceM.toFixed(1)}m)` : null,
    },
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * DELAY RING SPACING -- corrected.
 *
 * The standalone app doubled the distance from the main PA for every ring
 * (40m, 80m, 160m, 320m). That implies each successive tower covers twice
 * the depth of the one before it, which would require each tower to be twice
 * as powerful. Measured consequence: a 150m-deep crowd got only two towers,
 * the last at 80m, leaving 70m of audience with no reinforcement at all.
 *
 * Real delay rings are similar boxes covering similar depths, so they sit at
 * roughly CONSTANT spacing. The first ring goes where the main PA has dropped
 * 6dB (2x its design throw); every ring after that is spaced by the same
 * increment, clamped to a practical 25-45m band.
 *
 * Returns ring distances in meters, measured from the main PA along the
 * stage->crowd axis. O(MAX_DELAY_TOWERS).
 */
export function computeDelayRingDistances({ nearDepthM, farDepthM }) {
  const designThrowM = Math.max(nearDepthM || 0, MIN_MAIN_THROW_M)
  const firstRingM = designThrowM * SIX_DB_DOUBLING_RATIO
  const ringSpacingM = clamp(firstRingM, MIN_RING_SPACING_M, MAX_RING_SPACING_M)
  const lastUsefulM = farDepthM - MIN_MARGIN_TO_BACK_OF_CROWD_M

  const rings = []
  for (let k = 0; k < MAX_DELAY_TOWERS; k++) {
    const d = firstRingM + k * ringSpacingM
    if (d > lastUsefulM) break
    rings.push(d)
  }

  return { designThrowM, firstRingM, ringSpacingM, rings }
}

/**
 * Horizontal angle a hang at the origin must cover to span the crowd's
 * lateral extent, judged at the crowd's nearest depth (the worst case).
 */
export function computeCoverageAngleDeg(halfWidthM, nearDepthM) {
  if (!nearDepthM || nearDepthM <= 0) return 180
  return 2 * Math.atan2(halfWidthM, nearDepthM) * (180 / Math.PI)
}
