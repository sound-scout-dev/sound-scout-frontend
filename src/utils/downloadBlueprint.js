// Exports the blueprint <svg> as a PNG the organizer can hand to an AV crew.
// The live SVG is styled by CSS (currentColor, Tailwind classes) which does not
// survive serialisation, so the clone gets explicit colours baked in first.

const EXPORT_WIDTH_PX = 2400

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

function serialize(svgEl, { background, foreground }) {
  const clone = svgEl.cloneNode(true)

  // Export the whole plan, not whatever the user happened to be panned to.
  const fit = svgEl.getAttribute("data-fit-viewbox")
  if (fit) clone.setAttribute("viewBox", fit)

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("style", `color:${foreground};background:${background}`)

  const vb = (clone.getAttribute("viewBox") || "0 0 100 100").split(/\s+/).map(Number)
  const ratio = vb[3] / vb[2] || 1
  const width = EXPORT_WIDTH_PX
  const height = Math.round(width * ratio)
  clone.setAttribute("width", String(width))
  clone.setAttribute("height", String(height))

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  bg.setAttribute("x", String(vb[0]))
  bg.setAttribute("y", String(vb[1]))
  bg.setAttribute("width", String(vb[2]))
  bg.setAttribute("height", String(vb[3]))
  bg.setAttribute("fill", background)
  clone.insertBefore(bg, clone.firstChild)

  return { markup: new XMLSerializer().serializeToString(clone), width, height }
}

export async function downloadBlueprintPNG(svgEl, filename = "venue-blueprint.png", theme = {}) {
  if (!svgEl) return

  const background = theme.background || "#ffffff"
  const foreground = theme.foreground || "#0B0F13"
  const { markup, width, height } = serialize(svgEl, { background, foreground })
  const svgBlob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" })

  try {
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    // The venue photo layer is a same-origin object URL, so the canvas stays
    // untainted -- but if that ever changes, toBlob throws and we fall back.
    img.crossOrigin = "anonymous"

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error("blueprint image failed to load"))
      img.src = url
    })

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    URL.revokeObjectURL(url)

    const png = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
    if (!png) throw new Error("canvas export produced no data")
    triggerDownload(png, filename)
  } catch {
    // Still give them something usable rather than failing silently.
    triggerDownload(svgBlob, filename.replace(/\.png$/, ".svg"))
  }
}
