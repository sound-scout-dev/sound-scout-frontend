import { useState, useRef, useEffect } from "react"
import { Mic, Square, Loader2, Sparkles, X } from "lucide-react"
import Button from "../Button"
import Modal from "../Modal"

function VoiceInputModal({ isOpen, onClose, onDataExtracted }) {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [timer, setTimer] = useState(0)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(timerIntervalRef.current)
    }
  }, [])

  if (!isOpen) return null

  const startRecording = async () => {
    setError("")
    audioChunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        stream.getTracks().forEach(track => track.stop()) // release microphone
        await handleUpload(audioBlob)
      }

      mediaRecorder.start()
      setRecording(true)
      setTimer(0)
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Microphone access error:", err)
      setError("Microphone access denied or not supported.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      clearInterval(timerIntervalRef.current)
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleUpload = async (audioBlob) => {
    setProcessing(true)
    const formData = new FormData()
    formData.append("audio", audioBlob, "voice_intake.webm")

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "/api"
      const res = await fetch(`${apiBase}/ai-voice`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to process audio")
      }

      const data = await res.json()
      onDataExtracted(data.parameters || {})
      onClose()
    } catch (err) {
      console.error("Audio upload error:", err)
      setError(err.message || "Failed to analyze voice note. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <Modal title="Voice Wizard Intake" onClose={onClose}>
      <div className="flex flex-col items-center py-6">
        <Sparkles className="w-8 h-8 text-signal-amber animate-pulse mb-3" />
        <p className="text-center font-body text-sm text-slate mb-6 px-4">
          Speak naturally in **English, Sinhala, or code-switched Singlish** to describe your event. 
          We'll automatically extract your details!
        </p>

        {error && (
          <div className="w-full mb-4 px-4 py-2 bg-alert-red/10 border border-alert-red/30 rounded text-center text-xs text-alert-red">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center h-32 w-32 rounded-full border border-slate/10 bg-slate/5 relative">
          {recording && (
            <span className="absolute inset-0 rounded-full bg-signal-amber/10 animate-ping" />
          )}

          {processing ? (
            <Loader2 className="w-10 h-10 text-signal-amber animate-spin" />
          ) : recording ? (
            <button
              onClick={stopRecording}
              className="z-10 flex h-20 w-20 items-center justify-center rounded-full bg-alert-red text-white hover:bg-red-600 transition-colors"
            >
              <Square className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="z-10 flex h-20 w-20 items-center justify-center rounded-full bg-signal-amber text-ink-navy hover:bg-[#F2A633] transition-colors"
            >
              <Mic className="w-7 h-7" />
            </button>
          )}
        </div>

        <div className="mt-4 font-mono text-sm text-ink-navy font-semibold">
          {recording ? `Recording... ${formatTime(timer)}` : processing ? "AI Extracting Parameters..." : "Click to Record"}
        </div>

        <div className="mt-8 flex justify-end w-full px-4 border-t border-slate/10 pt-4">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default VoiceInputModal
