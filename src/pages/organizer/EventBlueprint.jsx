import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, UploadCloud, Loader2, Lock, AlertTriangle } from "lucide-react"
import Button from "../../components/Button"
import FormField from "../../components/FormField"
import BlueprintCanvas from "../../components/placement/BlueprintCanvas"
import { mapAvItems } from "../../placement/avMapper"
import { getEventById, analyzeVenuePhoto, subscribePremium } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import PremiumCheckoutModal from "../../components/PremiumCheckoutModal"

// Flattens event.plan.categories[].items[] (the shape every other page in
// this app already works with -- see BidSubmissionModal, EventPlanSummary)
// into the flat {label, qty} list avMapper.parseItems accepts directly.
function flattenPlanItems(plan) {
  if (!plan?.categories) return []
  return plan.categories.flatMap((cat) => cat.items || [])
}

function UpgradeCard({ onUpgraded }) {
  const { updateUser } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [error, setError] = useState("")

  function handleConfirmed() {
    setError("")
    return subscribePremium()
      .then((res) => {
        updateUser({ is_premium: true, subscription_expires_at: res.subscription_expires_at })
        setCheckoutOpen(false)
        onUpgraded()
      })
      .catch((err) => {
        setError("Could not start your subscription. Please try again.")
        throw err
      })
  }

  return (
    <div className="rounded-xl border border-signal-amber/30 bg-signal-amber/5 p-8 text-center">
      <Lock className="mx-auto text-signal-amber" size={28} strokeWidth={2} />
      <h2 className="mt-3 font-display text-lg font-semibold text-ink-navy dark:text-white">
        Venue Blueprint is a Premium feature
      </h2>
      <p className="mx-auto mt-2 max-w-md font-body text-sm text-slate">
        Upload a drone or overhead photo of your outdoor venue and get an AI-suggested stage
        placement plus exact speaker, sub, and delay-tower positions in meters.
      </p>
      {error && <p className="mt-3 font-mono text-xs text-alert-red">{error}</p>}
      <Button className="mt-5" onClick={() => setCheckoutOpen(true)}>
        Upgrade to Premium
      </Button>
      <PremiumCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onConfirmed={handleConfirmed}
      />
    </div>
  )
}

function EventBlueprint() {
  const { id } = useParams()
  const { user } = useAuth()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(user?.is_premium || false)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null) // AI response
  const [analyzeError, setAnalyzeError] = useState("")

  const [crowdDepthM, setCrowdDepthM] = useState(60)
  const [crowdHalfWidthM, setCrowdHalfWidthM] = useState(30)

  useEffect(() => {
    let active = true
    getEventById(id).then((e) => {
      if (active) {
        setEvent(e)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = useCallback(
    (e) => {
      const picked = e.target.files?.[0]
      if (!picked) return
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(picked)
      setPreviewUrl(URL.createObjectURL(picked))
      setAnalysis(null)
      setAnalyzeError("")
    },
    [previewUrl]
  )

  function handleAnalyze() {
    if (!file) return
    setAnalyzing(true)
    setAnalyzeError("")
    analyzeVenuePhoto(event.id, file)
      .then((result) => {
        if (!result.meters_per_pixel || !result.stage_box) {
          setAnalyzeError(
            result.scale_reasoning || result.stage_reasoning ||
              "Couldn't confidently read this photo. Try a clearer overhead shot with visible reference objects (cars, doors, people)."
          )
          return
        }
        setAnalysis(result)
      })
      .catch((err) => setAnalyzeError(err.message || "Analysis failed."))
      .finally(() => setAnalyzing(false))
  }

  const stageMeters = useMemo(() => {
    if (!analysis) return null
    const { stage_box, meters_per_pixel } = analysis
    return {
      widthM: (stage_box.x2 - stage_box.x1) * meters_per_pixel,
      depthM: (stage_box.y2 - stage_box.y1) * meters_per_pixel,
    }
  }, [analysis])

  const blueprint = useMemo(() => {
    if (!stageMeters || !event) return null
    return mapAvItems({
      items: flattenPlanItems(event.plan),
      stage: stageMeters,
      crowd: { nearM: 10, farM: 10 + Number(crowdDepthM || 0), halfWidthM: Number(crowdHalfWidthM || 0) },
    })
  }, [stageMeters, event, crowdDepthM, crowdHalfWidthM])

  if (loading) {
    return <div className="mx-auto max-w-5xl p-6 font-mono text-sm text-slate">Loading event…</div>
  }
  if (!event) {
    return <div className="mx-auto max-w-5xl p-6 font-mono text-sm text-alert-red">Event not found.</div>
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={`/organizer/events/${id}`} className="flex items-center gap-1.5 text-sm text-slate hover:text-ink-navy">
        <ArrowLeft size={16} strokeWidth={2} /> Back to event
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold text-ink-navy dark:text-white">Venue Blueprint</h1>
      <p className="mt-1 font-body text-sm text-slate">{event.name} — {event.eventType}</p>

      {event.environment !== "Outdoor" ? (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate/15 bg-white p-6 dark:bg-zinc-900">
          <AlertTriangle className="mt-0.5 shrink-0 text-signal-amber" size={20} strokeWidth={2} />
          <p className="font-body text-sm text-slate">
            Venue Blueprint is only available for outdoor events. This event is marked as{" "}
            <strong>{event.environment}</strong>.
          </p>
        </div>
      ) : !isPremium ? (
        <div className="mt-8">
          <UpgradeCard onUpgraded={() => setIsPremium(true)} />
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {!analysis && (
            <div className="rounded-xl border border-slate/15 bg-white p-6 dark:bg-zinc-900">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate/25 px-6 py-10 text-center hover:border-circuit-teal">
                <UploadCloud size={28} className="text-slate" strokeWidth={2} />
                <span className="font-body text-sm text-slate">
                  {file ? file.name : "Upload a drone or overhead photo of the venue"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              {previewUrl && (
                <img src={previewUrl} alt="Venue preview" className="mt-4 max-h-64 w-full rounded-lg object-contain" />
              )}

              {analyzeError && (
                <p className="mt-3 rounded border border-alert-red/30 bg-alert-red/5 p-3 font-mono text-xs text-alert-red">
                  {analyzeError}
                </p>
              )}

              <Button className="mt-4" onClick={handleAnalyze} disabled={!file || analyzing}>
                {analyzing ? <Loader2 size={16} className="animate-spin" /> : null}
                {analyzing ? "Analyzing photo…" : "Analyze Venue"}
              </Button>
            </div>
          )}

          {analysis && (
            <>
              <div className="rounded-xl border border-slate/15 bg-white p-5 dark:bg-zinc-900">
                <p className="font-mono text-xs uppercase tracking-widest text-slate">Scale ({analysis.scale_confidence} confidence)</p>
                <p className="mt-1 font-body text-sm text-ink-navy dark:text-white">{analysis.scale_reasoning}</p>
                <p className="mt-3 font-mono text-xs uppercase tracking-widest text-slate">Suggested stage</p>
                <p className="mt-1 font-body text-sm text-ink-navy dark:text-white">{analysis.stage_reasoning}</p>
                <button
                  onClick={() => {
                    setAnalysis(null)
                    setAnalyzeError("")
                  }}
                  className="mt-3 font-mono text-xs text-slate underline hover:text-ink-navy"
                >
                  Try a different photo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate/15 bg-white p-5 dark:bg-zinc-900 sm:grid-cols-2">
                <FormField
                  label="Crowd depth (m)"
                  name="crowdDepthM"
                  type="number"
                  min="10"
                  value={crowdDepthM}
                  onChange={(e) => setCrowdDepthM(e.target.value)}
                />
                <FormField
                  label="Crowd half-width (m)"
                  name="crowdHalfWidthM"
                  type="number"
                  min="5"
                  value={crowdHalfWidthM}
                  onChange={(e) => setCrowdHalfWidthM(e.target.value)}
                />
              </div>

              {blueprint && (
                <>
                  {blueprint.warnings.length > 0 && (
                    <ul className="space-y-1 rounded-lg border border-signal-amber/30 bg-signal-amber/5 p-3">
                      {blueprint.warnings.map((w) => (
                        <li key={w} className="font-mono text-xs text-signal-amber">! {w}</li>
                      ))}
                    </ul>
                  )}
                  <BlueprintCanvas
                    placements={blueprint.placements}
                    stage={stageMeters}
                    crowd={{ nearM: 10, farM: 10 + Number(crowdDepthM || 0), halfWidthM: Number(crowdHalfWidthM || 0) }}
                    rings={blueprint.rings}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default EventBlueprint
