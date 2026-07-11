import { useEffect, useState } from "react"

function CountUpStat({ value, suffix = "", label, duration = 1200 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = null
    let raf

    function step(timestamp) {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * value))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return (
    <div>
      <p className="font-mono text-2xl font-semibold text-signal-amber">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 font-body text-xs uppercase tracking-wide text-paper/50">{label}</p>
    </div>
  )
}

export default CountUpStat
