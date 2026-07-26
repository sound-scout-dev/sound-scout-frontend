import { useEffect, useRef, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { CheckCircle2, Loader2, XCircle, ArrowLeft } from "lucide-react"
import { getPaymentById } from "../../services/api"

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 10 // ~20s of polling before giving up and showing the "still pending" state

function PaymentReturn() {
  const { paymentId } = useParams()
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState("")
  const pollCount = useRef(0)

  useEffect(() => {
    let active = true
    let timer

    function poll() {
      getPaymentById(paymentId)
        .then((data) => {
          if (!active) return
          setPayment(data)
          pollCount.current += 1
          if (data.status === "pending" && pollCount.current < MAX_POLLS) {
            timer = setTimeout(poll, POLL_INTERVAL_MS)
          }
        })
        .catch((err) => {
          if (active) setError(err.message || "Couldn't look up this payment.")
        })
    }
    poll()

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [paymentId])

  const eventLink = payment ? `/organizer/events/${payment.event_id}` : "/organizer/dashboard"
  const stillPending = payment?.status === "pending" && pollCount.current >= MAX_POLLS

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
      {error && (
        <>
          <XCircle size={40} className="mx-auto text-alert-red" />
          <h1 className="mt-4 font-display text-xl font-semibold text-ink-navy">
            Couldn't confirm payment
          </h1>
          <p className="mt-2 font-body text-sm text-slate">{error}</p>
        </>
      )}

      {!error && !payment && (
        <>
          <Loader2 size={36} className="mx-auto animate-spin text-signal-amber" />
          <p className="mt-4 font-body text-sm text-slate">Checking payment status…</p>
        </>
      )}

      {!error && payment && payment.status === "completed" && (
        <>
          <CheckCircle2 size={40} className="mx-auto text-circuit-teal" />
          <h1 className="mt-4 font-display text-xl font-semibold text-ink-navy">
            Payment successful
          </h1>
          <p className="mt-2 font-body text-sm text-slate">
            Your payment for this booking has been confirmed.
          </p>
        </>
      )}

      {!error && payment && payment.status === "pending" && !stillPending && (
        <>
          <Loader2 size={36} className="mx-auto animate-spin text-signal-amber" />
          <p className="mt-4 font-body text-sm text-slate">
            Waiting for confirmation from PayHere…
          </p>
        </>
      )}

      {!error && payment && payment.status === "pending" && stillPending && (
        <>
          <Loader2 size={36} className="mx-auto text-signal-amber" />
          <h1 className="mt-4 font-display text-xl font-semibold text-ink-navy">
            Still waiting on confirmation
          </h1>
          <p className="mt-2 font-body text-sm text-slate">
            PayHere confirms payments through a server-to-server callback. If you're testing this
            locally, that callback can't reach your machine unless it's tunneled (e.g. with ngrok) —
            ask whoever set up the backend to check the webhook is reachable.
          </p>
        </>
      )}

      {!error && payment && (payment.status === "failed" || payment.status === "cancelled") && (
        <>
          <XCircle size={40} className="mx-auto text-alert-red" />
          <h1 className="mt-4 font-display text-xl font-semibold text-ink-navy">
            Payment {payment.status}
          </h1>
          <p className="mt-2 font-body text-sm text-slate">
            You can try paying again from the event page.
          </p>
        </>
      )}

      <Link
        to={eventLink}
        className="mt-8 inline-flex items-center gap-1.5 font-medium text-ink-navy underline decoration-signal-amber decoration-2 underline-offset-2 hover:text-signal-amber"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back to event
      </Link>
    </div>
  )
}

export default PaymentReturn
