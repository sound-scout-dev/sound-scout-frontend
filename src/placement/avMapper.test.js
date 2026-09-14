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
