import { describe, it, expect } from "vitest"
import { mapAvItems, classifyRole, extractQuantity, parseItems } from "./avMapper"
import { computeDelayRingDistances, isPointInPolygon, speedOfSoundMs } from "./acoustics"

const STAGE = { widthM: 12, depthM: 8 }
const CROWD = { nearM: 15, farM: 120, halfWidthM: 30 }

function byRole(placements, role) {
  return placements.filter((p) => p.role === role)
}

describe("item parsing", () => {
  it("extracts leading quantities", () => {
    expect(extractQuantity("8x JBL VTX A12")).toBe(8)
    expect(extractQuantity("12 LED Par Lights")).toBe(12)
    expect(extractQuantity("Soundcraft Console")).toBe(1)
  })

  it("classifies the specific roles before the generic ones", () => {
    expect(classifyRole("2x Delay Speakers")).toBe("delay_tower")
    expect(classifyRole("4x Subwoofers")).toBe("subwoofer")
    expect(classifyRole("8x Line Array Speakers")).toBe("main_pa")
    expect(classifyRole("6x Stage Monitor Wedges")).toBe("monitor")
    expect(classifyRole("1x Digital Mixing Console")).toBe("foh")
    expect(classifyRole("2x LED Video Wall")).toBe("led_screen")
    expect(classifyRole("1x 100kVA Generator")).toBe("power")
  })

  it("strips the quantity out of the display label", () => {
    const [item] = parseItems(["8x JBL VTX A12 Line Array Speakers"])
    expect(item.label).toBe("JBL VTX A12 Line Array Speakers")
    expect(item.quantity).toBe(8)
  })

  it("also accepts the {label, qty} shape event.plan.categories items are already in", () => {
    const [item] = parseItems([{ label: "JBL VTX A12 Line Array Speakers", qty: 8 }])
    expect(item.label).toBe("JBL VTX A12 Line Array Speakers")
    expect(item.quantity).toBe(8)
    expect(item.role).toBe("main_pa")
  })

  it("produces identical placements from equivalent string and object input", () => {
    const fromStrings = mapAvItems({ items: ["4x Delay Speakers"], stage: STAGE, crowd: CROWD })
    const fromObjects = mapAvItems({ items: [{ label: "Delay Speakers", qty: 4 }], stage: STAGE, crowd: CROWD })
    expect(fromStrings.placements).toEqual(fromObjects.placements)
  })

  // Real event_id=4 plan pulled from local Postgres: every structured qty is
  // hardcoded to 1 by this AI service version, and the actual count is
  // embedded in the label instead. Without LABEL_QUANTITY_PATTERN, every one
  // of these silently placed a single unit no matter how many were budgeted.
  it("extracts the real count from a live plan's label text, not the always-1 qty field", () => {
    const [linearray] = parseItems([{ qty: 1, label: "L-Acoustics K3 Line Array (12 units)" }])
    expect(linearray.quantity).toBe(12)
    expect(linearray.label).toBe("L-Acoustics K3 Line Array")

    const [wireless] = parseItems([{ qty: 1, label: "Shure Axient Digital Wireless System (4 channels)" }])
    expect(wireless.quantity).toBe(4)

    // "19x15W" is a wattage spec mid-label, not a leading quantity -- must not
    // be misread as 19 units.
    const [wash] = parseItems([{ qty: 1, label: "19x15W RGBW LED Wash (12 units)" }])
    expect(wash.quantity).toBe(12)
    expect(wash.label).toBe("19x15W RGBW LED Wash")

    // A parenthetical that isn't a unit count ("100A" is an amperage rating,
    // not a quantity) must fall back to the structured qty instead of matching.
    const [distro] = parseItems([{ qty: 1, label: "200A 3-Phase IP65 Distro (Optional: scalable to 100A for smaller setups)" }])
    expect(distro.quantity).toBe(1)

    // No parenthetical at all -- falls back to structured qty.
    const [console_] = parseItems([{ qty: 1, label: "DiGiCo SD12 Digital Console" }])
    expect(console_.quantity).toBe(1)
  })

  it("does not misclassify a delay SCREEN (video relay) as a delay TOWER (audio)", () => {
    // Real event_id=4 plan item -- "delay" alone as a keyword swallowed this
    // into delay_tower, producing a phantom "2 delay towers needed" warning
    // for a plan that had zero actual delay speakers.
    expect(classifyRole("3m x 2m P3.9 Delay Screens (2 units)")).toBe("led_screen")
    expect(classifyRole("2x Delay Speakers")).toBe("delay_tower")
    expect(classifyRole("1x Delay Tower")).toBe("delay_tower")
  })

  it("places the correct number of main PA units from a live plan, not just 1", () => {
    const { placements } = mapAvItems({
      items: [{ qty: 1, label: "L-Acoustics K3 Line Array (12 units)" }],
      stage: STAGE,
      crowd: CROWD,
    })
    const mains = byRole(placements, "main_pa")
    const totalUnits = mains.reduce((sum, m) => sum + m.quantity, 0)
    expect(totalUnits).toBe(12)
  })
})

describe("main PA and subs", () => {
  it("splits the main PA into a symmetric L/R pair inset from the stage edge", () => {
    const { placements } = mapAvItems({ items: ["8x Line Array Speakers"], stage: STAGE, crowd: CROWD })
    const mains = byRole(placements, "main_pa")
    expect(mains).toHaveLength(2)
    expect(mains[0].x_meters).toBeCloseTo(-4.8, 1)
    expect(mains[1].x_meters).toBeCloseTo(4.8, 1)
    expect(mains[0].quantity + mains[1].quantity).toBe(8)
    // inset from the 6m half-stage, not hanging off the edge
    expect(Math.abs(mains[1].x_meters)).toBeLessThan(STAGE.widthM / 2)
  })

  it("puts 4+ subs in a center ground array, fewer as L/R stacks", () => {
    const big = mapAvItems({ items: ["6x Subwoofers"], stage: STAGE, crowd: CROWD })
    const bigSubs = byRole(big.placements, "subwoofer")
    expect(bigSubs).toHaveLength(6)
    expect(bigSubs.every((s) => s.arrangement === "center ground array")).toBe(true)

    const small = mapAvItems({ items: ["2x Subwoofers"], stage: STAGE, crowd: CROWD })
    expect(byRole(small.placements, "subwoofer")).toHaveLength(2)
  })

  it("never places a sub or main behind the stage line", () => {
    const { placements } = mapAvItems({ items: ["4x Line Array", "4x Subwoofers"], stage: STAGE, crowd: CROWD })
    for (const p of placements) {
      if (p.role === "main_pa" || p.role === "subwoofer") expect(p.y_meters).toBeGreaterThanOrEqual(0)
    }
  })
})

describe("delay rings (the corrected spacing model)", () => {
  it("spaces rings at a constant interval, not by doubling", () => {
    const { rings } = computeDelayRingDistances({ nearDepthM: 15, farDepthM: 150 })
    const gaps = rings.slice(1).map((d, i) => d - rings[i])
    for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0], 5)
  })

  it("covers a deep crowd that the old doubling model left unserved", () => {
    // The standalone app produced only 2 towers (40m, 80m) for a 150m crowd,
    // leaving 70m with no reinforcement.
    const { rings } = computeDelayRingDistances({ nearDepthM: 15, farDepthM: 150 })
    expect(rings.length).toBeGreaterThanOrEqual(3)
    expect(150 - rings[rings.length - 1]).toBeLessThan(50)
  })

  it("places no ring when the crowd is shallow enough for the mains alone", () => {
    const { rings } = computeDelayRingDistances({ nearDepthM: 10, farDepthM: 35 })
    expect(rings).toHaveLength(0)
  })

  it("computes delay from distance and temperature, plus the Haas offset", () => {
    const { placements } = mapAvItems({
      items: ["4x Delay Speakers"], stage: STAGE, crowd: CROWD, temperatureC: 29,
    })
    const tower = byRole(placements, "delay_tower")[0]
    const expected = (tower.y_meters / speedOfSoundMs(29)) * 1000 + 15
    expect(tower.delayMs).toBeCloseTo(expected, 0)
  })

  it("warns when the plan has fewer delay towers than the crowd depth needs", () => {
    const { warnings } = mapAvItems({ items: ["8x Line Array", "1x Delay Speaker"], stage: STAGE, crowd: CROWD })
    expect(warnings.join(" ")).toMatch(/needs \d+/i)
  })

  it("warns when the plan lists no delay speakers but the crowd needs rings", () => {
    const { warnings } = mapAvItems({ items: ["8x Line Array Speakers"], stage: STAGE, crowd: CROWD })
    expect(warnings.join(" ")).toMatch(/no delay speakers/i)
  })

  it("plots no delay towers at all when the plan doesn't list any", () => {
    // The plan is the source of truth for what gets drawn -- a shortfall is
    // reported in the warnings, never invented as a marker on the map.
    const { placements, warnings } = mapAvItems({ items: ["8x Line Array Speakers"], stage: STAGE, crowd: CROWD })
    expect(byRole(placements, "delay_tower")).toHaveLength(0)
    expect(warnings.join(" ")).toMatch(/no delay speakers/i)
  })

  it("plots delay towers when the plan does list them", () => {
    const { placements } = mapAvItems({ items: ["8x Line Array", "4x Delay Speakers"], stage: STAGE, crowd: CROWD })
    expect(byRole(placements, "delay_tower").length).toBeGreaterThan(0)
  })

  it("skips a ring that falls outside the marked crowd polygon", () => {
    // Crowd polygon only spans y = 10..50, so the 60m ring is outside it.
    const polygon = [
      { x: -30, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 50 }, { x: -30, y: 50 },
    ]
    const { placements } = mapAvItems({
      items: ["4x Delay Speakers"],
      stage: STAGE,
      crowd: { nearM: 10, farM: 200, halfWidthM: 30, polygon },
    })
    for (const t of byRole(placements, "delay_tower")) {
      expect(isPointInPolygon({ x: t.x_meters, y: t.y_meters }, polygon)).toBe(true)
    }
  })
})

describe("every plan line reaches the map", () => {
  it("places mics, staging and unrecognised items instead of dropping them", () => {
    const { placements, warnings } = mapAvItems({
      items: [
        "8x Line Array Speakers",
        "4x Shure SM58 Microphones",
        "1x 8m x 6m Deck Stage Platform",
        "1x Cabling & Power Package for Audio Setup",
      ],
      stage: STAGE,
      crowd: CROWD,
    })
    expect(byRole(placements, "mic").length).toBeGreaterThan(0)
    expect(byRole(placements, "staging").length).toBeGreaterThan(0)
    expect(byRole(placements, "other").length).toBeGreaterThan(0)
    expect(warnings.join(" ")).not.toMatch(/not shown on the plan/i)
  })

  it("warns rather than silently dropping a role it cannot place", () => {
    const { placements, byRole: grouped } = mapAvItems({ items: ["8x Line Array Speakers"], stage: STAGE, crowd: CROWD })
    const placedRoles = new Set(placements.map((p) => p.role))
    for (const role of Object.keys(grouped)) {
      if (role === "delay_tower") continue
      expect(placedRoles.has(role)).toBe(true)
    }
  })
})

describe("supporting positions", () => {
  it("puts FOH on the centerline, inside the crowd, clear of the back edge", () => {
    const { placements } = mapAvItems({ items: ["1x Digital Mixing Console"], stage: STAGE, crowd: CROWD })
    const foh = byRole(placements, "foh")[0]
    expect(foh.x_meters).toBe(0)
    expect(foh.y_meters).toBeGreaterThan(CROWD.nearM)
    expect(foh.y_meters).toBeLessThanOrEqual(CROWD.farM - 5)
  })

  it("puts a single LED wall upstage and a pair flanking the stage", () => {
    const one = mapAvItems({ items: ["1x LED Video Wall"], stage: STAGE, crowd: CROWD })
    expect(byRole(one.placements, "led_screen")[0].y_meters).toBeLessThan(0)

    const two = mapAvItems({ items: ["2x LED Video Wall"], stage: STAGE, crowd: CROWD })
    const screens = byRole(two.placements, "led_screen")
    expect(screens).toHaveLength(2)
    expect(screens[0].x_meters).toBeCloseTo(-screens[1].x_meters, 5)
    expect(Math.abs(screens[0].x_meters)).toBeGreaterThan(STAGE.widthM / 2)
  })

  it("keeps the generator offstage and away from the audience", () => {
    const { placements } = mapAvItems({ items: ["1x 100kVA Generator"], stage: STAGE, crowd: CROWD })
    const gen = byRole(placements, "power")[0]
    expect(gen.y_meters).toBeLessThan(-STAGE.depthM)
    expect(Math.abs(gen.x_meters)).toBeGreaterThan(STAGE.widthM / 2)
  })

  it("spreads monitors across the stage front, on the stage", () => {
    const { placements } = mapAvItems({ items: ["6x Stage Monitor Wedges"], stage: STAGE, crowd: CROWD })
    const wedges = byRole(placements, "monitor")
    expect(wedges).toHaveLength(6)
    expect(wedges.every((w) => w.y_meters < 0)).toBe(true)
    const xs = wedges.map((w) => w.x_meters)
    expect(Math.max(...xs)).toBeLessThanOrEqual(STAGE.widthM / 2)
  })
})

describe("full plan", () => {
  const FULL = [
    "8x JBL VTX A12 Line Array Speakers",
    "4x Subwoofers",
    "2x Delay Speakers",
    "6x Stage Monitor Wedges",
    "1x Soundcraft Digital Mixing Console",
    "2x LED Video Wall",
    "12x LED Par Lights",
    "1x 100kVA Generator",
  ]

  it("maps every audio item to finite coordinates", () => {
    const { placements } = mapAvItems({ items: FULL, stage: STAGE, crowd: CROWD })
    expect(placements.length).toBeGreaterThan(10)
    for (const p of placements) {
      expect(Number.isFinite(p.x_meters)).toBe(true)
      expect(Number.isFinite(p.y_meters)).toBe(true)
    }
  })

  it("is deterministic -- same input, identical output", () => {
    const a = mapAvItems({ items: FULL, stage: STAGE, crowd: CROWD })
    const b = mapAvItems({ items: FULL, stage: STAGE, crowd: CROWD })
    expect(a.placements).toEqual(b.placements)
  })

  it("tolerates an empty or junk plan without throwing", () => {
    expect(() => mapAvItems({ items: [], stage: STAGE, crowd: CROWD })).not.toThrow()
    expect(() => mapAvItems({ items: null, stage: null, crowd: null })).not.toThrow()
    expect(mapAvItems({ items: ["", "   "], stage: STAGE, crowd: CROWD }).placements).toHaveLength(0)
  })
})
