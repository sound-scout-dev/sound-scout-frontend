import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { XCircle, ArrowLeft } from "lucide-react"
import { getPaymentById } from "../../services/api"

function PaymentCancel() {
  const { paymentId } = useParams()
  const [eventId, setEventId] = useState(null)

  useEffect(() => {
    getPaymentById(paymentId)
      .then((data) => setEventId(data.event_id))
      .catch(() => {})
  }, [paymentId])

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
      <XCircle size={40} className="mx-auto text-alert-red" />
      <h1 className="mt-4 font-display text-xl font-semibold text-ink-navy">
        Payment cancelled
      </h1>
      <p className="mt-2 font-body text-sm text-slate">
        You cancelled the checkout — no payment was made. You can try again from the event page.
      </p>

      <Link
        to={eventId ? `/organizer/events/${eventId}` : "/organizer/dashboard"}
        className="mt-8 inline-flex items-center gap-1.5 font-medium text-ink-navy underline decoration-signal-amber decoration-2 underline-offset-2 hover:text-signal-amber"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back to event
      </Link>
    </div>
  )
}

export default PaymentCancel
