// placement/avMapper.js
//
// Turns the AV equipment list the LangGraph pipeline already generates for an
// event (flat free-text lines like "4x JBL VTX A12 Line Array Speakers") into
// exact METER coordinates on the venue blueprint.
//
// VENUE FRAME
//   origin (0,0) = center of the stage's downstage (front) edge
//   +y           = from the stage toward the crowd
//   +x           = across the venue, stage-right positive
// Negative y is on/behind the stage. venueFrame.js converts this to image
// pixels for drawing over the drone photo.
//
// Coordinates are generated deterministically here rather than asked of
// Gemini: an LLM returns different geometry on every call and will happily
// put subwoofers in the middle of the crowd. Gemini supplies the spatial
// READING of the photo (scale, stage box, obstacles); this file does the
// placement.
//
// Complexity: one classification pass over the item list, then one placement
// pass per role group. No nested scans -- O(n) in the number of items.

import {
  DEFAULT_TEMPERATURE_C,
  computeDelay,
  computeDelayRingDistances,
  isPointInPolygon,
} from "./acoustics"

const QUANTITY_PATTERN = /^\s*(\d+)\s*x?\s*/i

// Ordered most-specific first: "delay speaker" must not match as a main PA,
// "subwoofer" must not match as a generic speaker.
const ROLE_KEYWORDS = [
  ["delay_tower", ["delay tower", "delay speaker", "delay stack", "delay"]],
  ["subwoofer", ["subwoofer", "sub bass", "subs", "sub "]],
  ["monitor", ["monitor", "wedge", "iem", "in-ear"]],
  ["foh", ["mixer", "console", "foh", "mixing desk", "digital desk"]],
  ["mic", ["microphone", "mic ", "mics", "di box"]],
  ["led_screen", ["led wall", "led screen", "projector", "screen", "video wall"]],
  ["lighting", ["moving head", "led par", "par can", "wash light", "laser", "follow spot", "light"]],
  ["power", ["generator", "power distro", "distro", "ups", "cable ramp"]],
  ["staging", ["stage deck", "truss", "barrier", "scaffold", "riser"]],
  ["main_pa", ["line array", "array", "pa system", "main pa", "top box", "loudspeaker", "speaker"]],
]

export function extractQuantity(text) {
  const match = text.match(QUANTITY_PATTERN)
  const n = match ? parseInt(match[1], 10) : 1
  return Number.isFinite(n) && n > 0 ? n : 1
}

export function classifyRole(text) {
  const lower = text.toLowerCase()
  for (const [role, keywords] of ROLE_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return role
  }
  return "other"
}

export function parseItems(rawItems) {
  return (rawItems || [])
    .filter((item) => typeof item === "string" && item.trim())
    .map((raw) => ({
      raw: raw.trim(),
      label: raw.replace(QUANTITY_PATTERN, "").trim() || raw.trim(),
      quantity: extractQuantity(raw),
      role: classifyRole(raw),
    }))
}

// Spreads `count` positions evenly across `spanM`, centered on x = 0.
// A single item lands dead center rather than off to one side.
function spreadAcross(count, spanM) {
  if (count <= 0) return []
  if (count === 1) return [0]
  const step = spanM / (count - 1)
  return Array.from({ length: count }, (_, i) => -spanM / 2 + i * step)
}

function place(item, role, positions, extra = {}) {
  return positions.map((pos, i) => ({
    id: `${role}-${i + 1}`,
    role,
    label: pos.label || item.label,
    sourceItem: item.raw,
    quantity: pos.quantity ?? 1,
    x_meters: round(pos.x),
    y_meters: round(pos.y),
    ...extra,
    ...(pos.meta || {}),
  }))
}

function round(n) {
  return Math.round(n * 10) / 10
}

function splitLeftRight(quantity) {
  const left = Math.ceil(quantity / 2)
  return [left, quantity - left]
}

/**
 * @param {object} args
 * @param {string[]} args.items      raw equipment lines from the AI plan
 * @param {object}   args.stage      { widthM, depthM }
 * @param {object}   args.crowd      { nearM, farM, halfWidthM, polygon? } in venue-frame meters
 * @param {number}   [args.temperatureC]
 * @returns {{ placements: object[], rings: object, warnings: string[], byRole: object }}
 */
export function mapAvItems({ items, stage, crowd, temperatureC = DEFAULT_TEMPERATURE_C }) {
  const stageWidthM = stage?.widthM > 0 ? stage.widthM : 8
  const stageDepthM = stage?.depthM > 0 ? stage.depthM : 6
  const nearM = Math.max(0, crowd?.nearM ?? 0)
  const farM = Math.max(nearM + 1, crowd?.farM ?? nearM + 30)
  const halfWidthM = Math.max(1, crowd?.halfWidthM ?? stageWidthM)

  const parsed = parseItems(items)
  const warnings = []
  const placements = []

  // Group quantities by role in a single pass.
  const byRole = {}
  for (const item of parsed) {
    if (!byRole[item.role]) byRole[item.role] = { quantity: 0, items: [] }
    byRole[item.role].quantity += item.quantity
    byRole[item.role].items.push(item)
  }

  const rings = computeDelayRingDistances({ nearDepthM: nearM, farDepthM: farM })
  const halfStage = stageWidthM / 2

  // --- Main PA: flown L/R at the stage's front corners, inset from the edge.
  const mainGroup = byRole.main_pa
  if (mainGroup) {
    const [leftQty, rightQty] = splitLeftRight(mainGroup.quantity)
    const offsetX = halfStage * 0.8
    const item = mainGroup.items[0]
    placements.push(
      ...place(item, "main_pa", [
        { x: -offsetX, y: 0, quantity: leftQty, label: `Main PA L (${leftQty}x)` },
        { x: offsetX, y: 0, quantity: rightQty, label: `Main PA R (${rightQty}x)` },
      ])
    )
  }

  // --- Subwoofers: 4+ become a center-spaced ground array (standard cardioid
  // /end-fire block); fewer than 4 go as stacks beside each main hang.
  const subGroup = byRole.subwoofer
  if (subGroup) {
    const qty = subGroup.quantity
    const item = subGroup.items[0]
    if (qty >= 4) {
      const spanM = Math.min(stageWidthM, qty * 1.2)
      placements.push(
        ...place(item, "subwoofer",
          spreadAcross(qty, spanM).map((x, i) => ({
            x, y: 0.5, label: `Sub ${i + 1}`,
            meta: { arrangement: "center ground array" },
          }))
        )
      )
    } else {
      const [leftQty, rightQty] = splitLeftRight(qty)
      const offsetX = halfStage * 0.6
      placements.push(
        ...place(item, "subwoofer", [
          { x: -offsetX, y: 0.5, quantity: leftQty, label: `Subs L (${leftQty}x)` },
          { x: offsetX, y: 0.5, quantity: rightQty, label: `Subs R (${rightQty}x)` },
        ])
      )
    }
  }

  // --- Delay towers: physics decides HOW MANY rings the crowd needs; the
  // equipment list decides how many are actually available. Reconciling the
  // two is the point of cross-checking against the plan.
  // With no delay speakers in the plan we still show where rings WOULD be
  // needed (paired with a warning below) -- but only if there's a plan at all,
  // so an empty list doesn't produce phantom towers.
  const ringsNeeded = parsed.length > 0 ? rings.rings.length : 0
  const delayQty = byRole.delay_tower?.quantity ?? 0
  const towersToPlace = Math.min(ringsNeeded, delayQty || ringsNeeded)

  if (ringsNeeded > 0 && delayQty === 0) {
    warnings.push(
      `Crowd depth needs ${ringsNeeded} delay ring${ringsNeeded > 1 ? "s" : ""} (first at ${rings.rings[0].toFixed(0)}m), but the equipment plan lists no delay speakers.`
    )
  } else if (delayQty > 0 && delayQty < ringsNeeded) {
    warnings.push(
      `Plan lists ${delayQty} delay tower${delayQty > 1 ? "s" : ""}, but the crowd depth needs ${ringsNeeded}. Back ${Math.round(farM - rings.rings[delayQty - 1])}m may be under-covered.`
    )
  } else if (delayQty > ringsNeeded) {
    warnings.push(`Plan lists ${delayQty} delay towers; only ${ringsNeeded} ring${ringsNeeded === 1 ? "" : "s"} are needed for this crowd depth.`)
  }

  // Wide crowds get a tower each side of the centerline; narrow ones a single
  // tower on axis.
  const splitTowers = halfWidthM > 25
  const towerItem = byRole.delay_tower?.items[0] || { raw: "Delay tower (suggested)", label: "Delay tower" }

  for (let i = 0; i < towersToPlace; i++) {
    const ringM = rings.rings[i]
    const delay = computeDelay(ringM, temperatureC, rings.designThrowM)
    const xs = splitTowers ? [-halfWidthM * 0.5, halfWidthM * 0.5] : [0]

    xs.forEach((x, side) => {
      const point = { x, y: ringM }
      if (crowd?.polygon && !isPointInPolygon(point, crowd.polygon)) {
        warnings.push(`Delay ring ${i + 1} at ${ringM.toFixed(0)}m falls outside the marked crowd area and was skipped.`)
        return
      }
      placements.push({
        id: `delay_tower-${i + 1}${splitTowers ? (side === 0 ? "L" : "R") : ""}`,
        role: "delay_tower",
        label: `Delay ${i + 1}${splitTowers ? (side === 0 ? " L" : " R") : ""}`,
        sourceItem: towerItem.raw,
        quantity: 1,
        x_meters: round(x),
        y_meters: round(ringM),
        delayMs: Math.round(delay.recommendedDelayMs * 10) / 10,
        splDeltaDb: delay.splDeltaDb === null ? null : Math.round(delay.splDeltaDb * 10) / 10,
        formula: delay.formula,
      })
    })
  }

  // --- Stage monitors: along the downstage edge, facing back at the performers.
  const monitorGroup = byRole.monitor
  if (monitorGroup) {
    const item = monitorGroup.items[0]
    placements.push(
      ...place(item, "monitor",
        spreadAcross(monitorGroup.quantity, stageWidthM * 0.8).map((x, i) => ({
          x, y: -1, label: `Wedge ${i + 1}`,
        }))
      )
    )
  }

  // --- FOH: on the centerline about two-thirds back, the classic mix position,
  // kept clear of the last few meters of crowd.
  const fohGroup = byRole.foh
  if (fohGroup) {
    const fohY = Math.min(Math.max(farM * 0.66, nearM + 2), farM - 5)
    const item = fohGroup.items[0]
    placements.push(...place(item, "foh", [{ x: 0, y: fohY, quantity: fohGroup.quantity, label: "FOH / Mix position" }]))
  }

  // --- LED walls: one goes upstage center as a backdrop; two or more flank
  // the stage as IMAG screens.
  const screenGroup = byRole.led_screen
  if (screenGroup) {
    const qty = screenGroup.quantity
    const item = screenGroup.items[0]
    if (qty === 1) {
      placements.push(...place(item, "led_screen", [{ x: 0, y: -stageDepthM, label: "LED wall (upstage)" }]))
    } else {
      const [leftQty, rightQty] = splitLeftRight(qty)
      const offsetX = halfStage + 2
      placements.push(
        ...place(item, "led_screen", [
          { x: -offsetX, y: -1, quantity: leftQty, label: `LED wall L (${leftQty}x)` },
          { x: offsetX, y: -1, quantity: rightQty, label: `LED wall R (${rightQty}x)` },
        ])
      )
    }
  }

  // --- Lighting: spread on truss over the stage.
  const lightGroup = byRole.lighting
  if (lightGroup) {
    const item = lightGroup.items[0]
    placements.push(
      ...place(item, "lighting",
        spreadAcross(Math.min(lightGroup.quantity, 8), stageWidthM * 0.9).map((x, i) => ({
          x, y: -stageDepthM * 0.5, label: `Lighting ${i + 1}`,
        }))
      )
    )
  }

  // --- Generators: offstage and well away from the audience, for noise and
  // cable-run reasons.
  const powerGroup = byRole.power
  if (powerGroup) {
    const item = powerGroup.items[0]
    placements.push(
      ...place(item, "power", [{
        x: -(halfStage + 8),
        y: -stageDepthM - 3,
        quantity: powerGroup.quantity,
        label: `Power / Generator (${powerGroup.quantity}x)`,
      }])
    )
  }

  const coverageWarning = rings.rings.length === 0 && farM - nearM > 60
  if (coverageWarning) {
    warnings.push(`Crowd is ${Math.round(farM - nearM)}m deep but no delay ring fits before the back edge -- check the scale estimate.`)
  }

  return { placements, rings, warnings, byRole }
}
