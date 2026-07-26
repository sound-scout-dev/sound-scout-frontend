import { useState } from "react"
import { Star } from "lucide-react"

function StarRatingInput({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating out of 5 stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="rounded p-0.5 transition-colors duration-100 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-amber disabled:cursor-not-allowed"
        >
          <Star
            size={26}
            strokeWidth={1.5}
            className={n <= display ? "fill-signal-amber text-signal-amber" : "text-slate/30"}
          />
        </button>
      ))}
    </div>
  )
}

export default StarRatingInput
