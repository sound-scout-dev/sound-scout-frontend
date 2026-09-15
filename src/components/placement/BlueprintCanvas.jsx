import { memo, useCallback, useMemo, useRef, useState } from "react"
import { Download } from "lucide-react"
import { downloadBlueprintPNG } from "../../utils/downloadBlueprint"

// SVG user units ARE meters, so the 1m grid is literally 1 unit and every
// coordinate from avMapper.js can be used without conversion. The venue frame's
// +y (toward the crowd) maps to SVG's +y (down), which puts the stage at the
// top -- the conventional orientation for a stage plot.
//
// Rendering notes, since this is the part that has to stay smooth:
//  - The 1m/10m grid is a <pattern>, so it's TWO DOM nodes no matter how large
//    the venue is. Drawing real lines would be ~180 nodes for a 120x60m site.
//  - Pan/zoom only mutates the viewBox string on the root <svg>; markers never
//    re-render, so there is no per-frame React work proportional to item count.
//  - Markers are memo'd and keyed by id.

const ROLE_STYLES = {
  main_pa: { fill: "#1F8A70", shape: "array", legend: "Main PA" },
  subwoofer: { fill: "#12122B", shape: "square", legend: "Subwoofer" },
  delay_tower: { fill: "#FFB020", shape: "tower", legend: "Delay tower" },
  monitor: { fill: "#5C5C6E", shape: "wedge", legend: "Stage monitor" },
  foh: { fill: "#E5484D", shape: "diamond", legend: "FOH / Mix" },
  led_screen: { fill: "#6366F1", shape: "screen", legend: "LED wall" },
  lighting: { fill: "#A855F7", shape: "circle", legend: "Lighting" },
  power: { fill: "#78716C", shape: "square", legend: "Power" },
  mic: { fill: "#0EA5E9", shape: "circle", legend: "Mic" },
  staging: { fill: "#94A3B8", shape: "square", legend: "Staging" },
  other: { fill: "#94A3B8", shape: "circle", legend: "Other" },
}

// Stage-area gear (mains, subs, wedges, lighting) all lives within ~15m of the
// stage while the crowd runs 100m+ deep, so at fit-zoom those labels collapse
// into an unreadable pile. Below this view width every label is drawn; above
// it, only the roles that are genuinely spread out keep theirs.
const LABEL_ZOOM_THRESHOLD_M = 70
const SPARSE_ROLES = new Set(["delay_tower", "foh", "power"])

// A venue 120m deep by 24m wide would render as a sliver. Widening the extent
// to this max height:width ratio fills the container and makes stage detail
// legible, at the cost of some empty margin either side.
const MAX_ASPECT = 1.3

function MarkerShape({ shape, fill, r: MARKER_R }) {
  switch (shape) {
    case "square":
      return <rect x={-MARKER_R} y={-MARKER_R} width={MARKER_R * 2} height={MARKER_R * 2} fill={fill} rx={MARKER_R * 0.2} />
    case "diamond":
      return <rect x={-MARKER_R} y={-MARKER_R} width={MARKER_R * 2} height={MARKER_R * 2} fill={fill} rx={MARKER_R * 0.2} transform="rotate(45)" />
    case "tower":
      return (
        <g fill={fill}>
          <circle r={MARKER_R} />
          <rect x={-MARKER_R * 0.22} y={-MARKER_R * 2.4} width={MARKER_R * 0.44} height={MARKER_R * 1.6} />
        </g>
      )
    case "array":
      return (
        <g fill={fill}>
          <rect x={-MARKER_R * 0.7} y={-MARKER_R} width={MARKER_R * 1.4} height={MARKER_R * 2} rx={MARKER_R * 0.2} />
          <rect x={-MARKER_R} y={MARKER_R * 0.35} width={MARKER_R * 2} height={MARKER_R * 0.32} rx={MARKER_R * 0.12} />
        </g>
      )
    case "wedge":
      return <path d={`M ${-MARKER_R} ${MARKER_R} L ${MARKER_R} ${MARKER_R} L ${MARKER_R * 0.4} ${-MARKER_R} Z`} fill={fill} />
    case "screen":
      return <rect x={-MARKER_R * 1.6} y={-MARKER_R * 0.7} width={MARKER_R * 3.2} height={MARKER_R * 1.4} fill={fill} rx={MARKER_R * 0.15} />
    default:
      return <circle r={MARKER_R} fill={fill} />
  }
}

const Marker = memo(function Marker({ item, selected, labelText, fontM, markerM, onSelect }) {
  const style = ROLE_STYLES[item.role] || ROLE_STYLES.other
  return (
    <g
      transform={`translate(${item.x_meters} ${item.y_meters})`}
      onClick={() => onSelect?.(item)}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${item.label} at ${item.x_meters} by ${item.y_meters} meters`}
    >
      {selected && <circle r={markerM * 2.1} fill="none" stroke={style.fill} strokeWidth={fontM * 0.3} opacity={0.9} />}
      {/* Advisory positions (needed by the room but absent from the quote) are
          drawn hollow and ringed so they read as a recommendation, not kit. */}
      {item.suggested && (
        <circle
          r={markerM * 1.6}
          fill="none"
          stroke={style.fill}
          strokeWidth={fontM * 0.18}
          strokeDasharray={`${fontM * 0.45} ${fontM * 0.35}`}
          opacity={0.85}
        />
      )}
      <g opacity={item.suggested ? 0.45 : 1}>
        <MarkerShape shape={style.shape} fill={style.fill} r={markerM} />
      </g>
      {labelText && (
        <text
          y={markerM + fontM * 1.5}
          textAnchor="middle"
          fontSize={fontM}
          fill="currentColor"
          className="pointer-events-none select-none font-mono"
        >
          {labelText}
          {item.suggested && (
            <tspan x={0} dy={fontM * 1.15} opacity={0.7} fontSize={fontM * 0.85}>
              (not in plan)
            </tspan>
          )}
        </text>
      )}
    </g>
  )
})

function BlueprintCanvas({
  placements = [],
  stage,
  crowd,
  rings,
  imageUrl = null,
  showLabels = true,
  showGrid = true,
  onSelect,
  exportName = "venue-blueprint",
  className = "",
}) {
  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState(null) // null = auto-fit
  const svgRef = useRef(null)
  const dragRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const dark = document.documentElement.classList.contains("dark")
      await downloadBlueprintPNG(svgRef.current, `${exportName}.png`, {
        background: dark ? "#09090b" : "#ffffff",
        foreground: dark ? "#e4e4e7" : "#0B0F13",
      })
    } finally {
      setDownloading(false)
    }
  }, [exportName])

  const stageWidthM = stage?.widthM > 0 ? stage.widthM : 8
  const stageDepthM = stage?.depthM > 0 ? stage.depthM : 6
  const farM = crowd?.farM ?? 60
  const halfWidthM = Math.max(crowd?.halfWidthM ?? 30, stageWidthM)

  // Auto-fit extent, recomputed only when the geometry actually changes.
  const fitted = useMemo(() => {
    const xs = placements.map((p) => p.x_meters)
    const ys = placements.map((p) => p.y_meters)
    const pad = 8
    const minX = Math.min(-halfWidthM, ...xs) - pad
    const maxX = Math.max(halfWidthM, ...xs) + pad
    const minY = Math.min(-stageDepthM - 6, ...ys) - pad
    const maxY = Math.max(farM, ...ys) + pad

    let w = maxX - minX
    const h = maxY - minY
    let x = minX
    if (h / w > MAX_ASPECT) {
      const widened = h / MAX_ASPECT
      x -= (widened - w) / 2
      w = widened
    }
    return { x, y: minY, w, h }
  }, [placements, halfWidthM, stageDepthM, farM])

  const box = view || fitted
  const viewBox = `${box.x} ${box.y} ${box.w} ${box.h}`
  const detailZoom = box.w <= LABEL_ZOOM_THRESHOLD_M

  // SVG units are meters, so a fixed fontSize would grow as you zoom in. Sizing
  // text and strokes as a fraction of the view width keeps them visually
  // constant on screen at any zoom level.
  const fontM = box.w * 0.014
  const strokeM = box.w * 0.004
  // Equipment markers are SYMBOLS, not footprints -- a par can is 30cm and
  // would vanish at fit-zoom, so size them on screen rather than in meters.
  const markerM = box.w * 0.009

  // Dense rows (8 lighting fixtures, 6 wedges) get one group label at the
  // middle marker instead of eight overlapping ones -- the way a real stage
  // plot is annotated.
  const labels = useMemo(() => {
    const groups = new Map()
    for (const p of placements) {
      if (!groups.has(p.role)) groups.set(p.role, [])
      groups.get(p.role).push(p)
    }
    const out = new Map()
    for (const [role, group] of groups) {
      if (group.length <= 2) {
        group.forEach((p) => out.set(p.id, p.label))
      } else {
        const mid = group[Math.floor(group.length / 2)]
        const total = group.reduce((sum, p) => sum + (p.quantity || 1), 0)
        out.set(mid.id, `${ROLE_STYLES[role]?.legend || role} x${total}`)
      }
    }
    return out
  }, [placements])

  const zoomToStage = useCallback(() => {
    const w = Math.max(stageWidthM * 3, 34)
    setView({ x: -w / 2, y: -stageDepthM - 8, w, h: (w / MAX_ASPECT) * 0.9 })
  }, [stageWidthM, stageDepthM])

  const handleWheel = useCallback(
    (e) => {
      const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12
      setView((prev) => {
        const b = prev || fitted
        const w = Math.min(Math.max(b.w * factor, 15), 1200)
        const h = b.h * (w / b.w)
        return { x: b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w, h }
      })
    },
    [fitted]
  )

  const handlePointerDown = useCallback(
    (e) => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return
      dragRef.current = { startX: e.clientX, startY: e.clientY, box: view || fitted, pxPerM: rect.width / (view || fitted).w }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [view, fitted]
  )

  const handlePointerMove = useCallback((e) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = (e.clientX - drag.startX) / drag.pxPerM
    const dy = (e.clientY - drag.startY) / drag.pxPerM
    setView({ ...drag.box, x: drag.box.x - dx, y: drag.box.y - dy })
  }, [])

  const handlePointerUp = useCallback((e) => {
    dragRef.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }, [])

  const handleSelect = useCallback(
    (item) => {
      setSelectedId(item.id)
      onSelect?.(item)
    },
    [onSelect]
  )

  const legendRoles = useMemo(
    () => [...new Set(placements.map((p) => p.role))].filter((r) => ROLE_STYLES[r]),
    [placements]
  )

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        data-fit-viewbox={`${fitted.x} ${fitted.y} ${fitted.w} ${fitted.h}`}
        className="w-full touch-none rounded-md border border-slate/15 bg-paper text-ink-navy dark:bg-zinc-950 dark:text-zinc-100"
        style={{ aspectRatio: `${box.w} / ${box.h}`, maxHeight: "70vh" }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <pattern id="grid-1m" width={1} height={1} patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke="currentColor" strokeWidth={0.04} opacity={0.18} />
          </pattern>
          <pattern id="grid-10m" width={10} height={10} patternUnits="userSpaceOnUse">
            <rect width={10} height={10} fill="url(#grid-1m)" />
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth={0.12} opacity={0.35} />
          </pattern>
        </defs>

        {imageUrl && (
          <image
            href={imageUrl}
            x={-halfWidthM}
            y={-stageDepthM}
            width={halfWidthM * 2}
            height={farM + stageDepthM}
            preserveAspectRatio="xMidYMid slice"
            opacity={0.55}
          />
        )}

        {showGrid && <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="url(#grid-10m)" />}

        {/* Crowd area */}
        {crowd?.polygon ? (
          <polygon
            points={crowd.polygon.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="#1F8A70" fillOpacity={0.07} stroke="#1F8A70" strokeOpacity={0.4} strokeWidth={0.25}
          />
        ) : (
          <rect
            x={-halfWidthM} y={crowd?.nearM ?? 10} width={halfWidthM * 2} height={Math.max(1, farM - (crowd?.nearM ?? 10))}
            fill="#1F8A70" fillOpacity={0.07} stroke="#1F8A70" strokeOpacity={0.4} strokeWidth={0.25}
          />
        )}

        {/* Delay ring coverage arcs */}
        {rings?.rings?.map((d) => (
          <g key={`ring-${d}`}>
            <line x1={-halfWidthM} y1={d} x2={halfWidthM} y2={d} stroke="#FFB020" strokeWidth={strokeM * 0.5} strokeDasharray={`${fontM} ${fontM}`} opacity={0.7} />
            <text x={-halfWidthM + fontM} y={d - fontM * 0.6} fontSize={fontM} fill="#FFB020" className="select-none font-mono">{d}m</text>
          </g>
        ))}

        {/* Stage */}
        <g>
          <rect
            x={-stageWidthM / 2} y={-stageDepthM} width={stageWidthM} height={stageDepthM}
            fill="#12122B" fillOpacity={0.12} stroke="#12122B" strokeWidth={strokeM}
            className="dark:stroke-zinc-300"
          />
          <text x={0} y={-stageDepthM * 0.82} textAnchor="middle" fontSize={fontM * 1.2} fill="currentColor" className="select-none font-display">
            STAGE
          </text>
          <line x1={-stageWidthM / 2} y1={0} x2={stageWidthM / 2} y2={0} stroke="#12122B" strokeWidth={strokeM * 1.4} className="dark:stroke-zinc-300" />
        </g>

        {placements.map((item) => {
          const visible = showLabels && (detailZoom || SPARSE_ROLES.has(item.role) || item.id === selectedId)
          const text = item.id === selectedId ? item.label : labels.get(item.id)
          return (
            <Marker
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              labelText={visible ? text : null}
              fontM={fontM}
              markerM={markerM}
              onSelect={handleSelect}
            />
          )
        })}

        {/* Scale bar, anchored bottom-left of the current view. The reference
            length steps with zoom so the bar stays a sensible width on screen. */}
        {(() => {
          const nice = [1, 2, 5, 10, 20, 50, 100]
          const target = box.w * 0.15
          const barM = nice.reduce((best, n) => (Math.abs(n - target) < Math.abs(best - target) ? n : best), nice[0])
          const tick = fontM * 0.5
          return (
            <g transform={`translate(${box.x + box.w * 0.04} ${box.y + box.h - box.h * 0.05})`}>
              <line x1={0} y1={0} x2={barM} y2={0} stroke="currentColor" strokeWidth={strokeM} />
              <line x1={0} y1={-tick} x2={0} y2={tick} stroke="currentColor" strokeWidth={strokeM} />
              <line x1={barM} y1={-tick} x2={barM} y2={tick} stroke="currentColor" strokeWidth={strokeM} />
              <text x={barM / 2} y={-fontM * 0.8} textAnchor="middle" fontSize={fontM} fill="currentColor" className="select-none font-mono">
                {barM} m
              </text>
            </g>
          )
        })()}
      </svg>

      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-x-3 gap-y-1 rounded border border-slate/15 bg-white/85 px-2.5 py-1.5 backdrop-blur-sm dark:bg-zinc-900/85">
        {legendRoles.map((role) => (
          <span key={role} className="flex items-center gap-1.5 font-mono text-[10px] text-slate dark:text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: ROLE_STYLES[role].fill }} />
            {ROLE_STYLES[role].legend}
          </span>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-1.5">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1 rounded border border-slate/25 bg-white/90 px-2.5 py-1 font-mono text-[10px] text-slate transition-colors hover:text-ink-navy disabled:opacity-60 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-white"
        >
          <Download size={11} />
          {downloading ? "Saving…" : "Download"}
        </button>
        <button
          onClick={zoomToStage}
          className="rounded border border-slate/25 bg-white/90 px-2.5 py-1 font-mono text-[10px] text-slate transition-colors hover:text-ink-navy dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-white"
        >
          Zoom to stage
        </button>
        {view && (
          <button
            onClick={() => setView(null)}
            className="rounded border border-slate/25 bg-white/90 px-2.5 py-1 font-mono text-[10px] text-slate transition-colors hover:text-ink-navy dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-white"
          >
            Fit all
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(BlueprintCanvas)
