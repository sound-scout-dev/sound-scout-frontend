import { useState } from "react"
import FormField from "../FormField"
import Button from "../Button"
import { EVENT_TYPES } from "../../services/mockData"
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles, CheckCircle2 } from "lucide-react"

function StepConfirmation({ values, onChange, onConfirm, onBack }) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploadError, setUploadError] = useState("")

  const setField = (name) => (e) => onChange(name, e.target.value)

  const toggleRequirement = (req) => {
    const current = values.requirements || []
    if (current.includes(req)) {
      onChange("requirements", current.filter((r) => r !== req))
    } else {
      onChange("requirements", [...current, req])
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)

    const formData = new FormData()
    formData.append("image", file)

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "/api"
      const res = await fetch(`${apiBase}/ai-image`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Failed to analyze venue photo.")
      }

      const data = await res.json()
      onChange("venue_photo_analysis", data)
    } catch (err) {
      console.error(err)
      setUploadError("Failed to analyze venue layout. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const analysis = values.venue_photo_analysis

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink-navy">Confirm Event Details</h2>
      <p className="mt-1 font-body text-sm text-slate">
        Please review and adjust the extracted details before generating your plan.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <FormField
          label="Event name"
          name="eventName"
          value={values.eventName}
          onChange={setField("eventName")}
          className="sm:col-span-2"
        />

        <FormField
          as="select"
          label="Event type"
          name="eventType"
          value={values.eventType}
          onChange={setField("eventType")}
        >
          <option value="">Select a type…</option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </FormField>

        <FormField
          label="Event date"
          name="date"
          type="date"
          value={values.date}
          onChange={setField("date")}
        />

        <FormField
          label="Expected crowd size"
          name="crowdSize"
          type="number"
          min="1"
          value={values.crowdSize}
          onChange={setField("crowdSize")}
        />

        <FormField
          label="Venue size (m²)"
          name="venueSizeSqm"
          type="number"
          min="1"
          placeholder="Leave blank if unknown"
          value={values.venueSizeSqm}
          onChange={setField("venueSizeSqm")}
        />

        <FormField
          label="Budget min (LKR)"
          name="budgetMin"
          type="number"
          min="1"
          value={values.budgetMin}
          onChange={setField("budgetMin")}
        />

        <FormField
          label="Budget max (LKR)"
          name="budgetMax"
          type="number"
          min="1"
          value={values.budgetMax}
          onChange={setField("budgetMax")}
        />

        <FormField
          label="Location"
          name="location"
          value={values.location}
          onChange={setField("location")}
          className="sm:col-span-2"
        />

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink-navy">Environment</label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate">
              <input
                type="radio"
                name="environment"
                value="Indoor"
                checked={values.environment === "Indoor"}
                onChange={setField("environment")}
                className="text-signal-amber focus:ring-signal-amber"
              />
              Indoor
            </label>
            <label className="flex items-center gap-2 text-sm text-slate">
              <input
                type="radio"
                name="environment"
                value="Outdoor"
                checked={values.environment === "Outdoor"}
                onChange={setField("environment")}
                className="text-signal-amber focus:ring-signal-amber"
              />
              Outdoor
            </label>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink-navy">Requirements</label>
          <div className="mt-2 flex flex-wrap gap-4">
            {["Audio", "Lighting", "Staging", "Visuals", "Power"].map((req) => (
              <label key={req} className="flex items-center gap-2 text-sm text-slate">
                <input
                  type="checkbox"
                  checked={(values.requirements || []).includes(req)}
                  onChange={() => toggleRequirement(req)}
                  className="rounded text-signal-amber focus:ring-signal-amber"
                />
                {req}
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-ink-navy">
            Event Description (extracted from voice note)
          </label>
          <textarea
            id="description"
            rows={4}
            value={values.description}
            onChange={setField("description")}
            className="mt-1 block w-full rounded border border-slate/25 px-3 py-2 text-sm font-body text-ink-navy shadow-sm placeholder:text-slate/40 focus:border-signal-amber focus:ring-1 focus:ring-signal-amber focus:outline-none"
          />
        </div>

        {/* Spatial & Acoustic Venue Analysis Uploader */}
        <div className="sm:col-span-2 border-t border-slate/10 pt-6">
          <label className="block text-sm font-semibold text-ink-navy mb-2">
            Venue Photo Analysis (Vision AI)
          </label>
          <p className="text-xs text-slate mb-4">
            Upload an image of the venue. Gemini will analyze the acoustics and spatial hazards to optimize your AV plan!
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              {previewUrl ? (
                <div className="relative aspect-video sm:aspect-square w-full rounded-lg border border-slate/15 overflow-hidden bg-slate/5 flex items-center justify-center">
                  <img src={previewUrl} alt="Venue preview" className="object-cover w-full h-full" />
                  {uploading && (
                    <div className="absolute inset-0 bg-ink-navy/40 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video sm:aspect-square w-full rounded-lg border-2 border-dashed border-slate/20 bg-slate/5 hover:bg-slate/10 cursor-pointer transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate/60 mb-2" />
                  <span className="text-xs text-slate font-medium text-center px-2">Upload Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <div className="sm:col-span-2 flex flex-col justify-center">
              {uploading && (
                <div className="text-sm font-body text-slate flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-signal-amber animate-spin" />
                  Analyzing venue architecture & materials...
                </div>
              )}

              {uploadError && (
                <div className="text-xs text-alert-red font-medium">{uploadError}</div>
              )}

              {analysis && !uploading && (
                <div className="bg-circuit-teal/5 border border-circuit-teal/20 rounded-lg p-4">
                  <div className="flex items-center gap-1.5 text-circuit-teal text-sm font-semibold mb-2">
                    <CheckCircle2 size={16} />
                    Acoustic & Spatial Profiling Online
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-slate font-mono uppercase tracking-wide">
                    <div>Reflective Walls: <span className="font-bold text-ink-navy">{analysis.reflective_surfaces ? "Yes" : "No"}</span></div>
                    <div>Low Ceiling: <span className="font-bold text-ink-navy">{analysis.low_ceiling ? "Yes" : "No"}</span></div>
                    <div>High Ambient Light: <span className="font-bold text-ink-navy">{analysis.high_ambient_light ? "Yes" : "No"}</span></div>
                    <div>Outdoor Field: <span className="font-bold text-ink-navy">{analysis.outdoor_dissipation ? "Yes" : "No"}</span></div>
                  </div>

                  {analysis.visual_insights && analysis.visual_insights.length > 0 && (
                    <div className="border-t border-slate/10 pt-2">
                      <div className="text-xs font-semibold text-ink-navy flex items-center gap-1 mb-1">
                        <Sparkles size={12} className="text-signal-amber" />
                        AI Specialist Recommendations:
                      </div>
                      <ul className="list-disc pl-4 text-xs text-slate space-y-1">
                        {analysis.visual_insights.map((insight, idx) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!analysis && !uploading && (
                <div className="text-xs text-slate/60 italic font-body">
                  No venue photo uploaded. Plan will generate with default spatial assumptions.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline-dark" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="button" variant="primary" size="lg" onClick={onConfirm}>
          Confirm & Generate Plan
        </Button>
      </div>
    </div>
  )
}

export default StepConfirmation
