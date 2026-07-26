import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { BrainCircuit, Store, Zap, MessageSquareText, Cpu, Gavel } from "lucide-react"
import Button from "../components/Button"
import SpecCard from "../components/SpecCard"
import SignalPanel from "../components/SignalPanel"
import { heroPlan } from "../services/mockData"
import { useAuth } from "../context/AuthContext"

// Butter-smooth Scroll Reveal Animation Component
function ScrollReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Counting Animation Component triggered when scrolled into view
function AnimatedCounter({ targetValue, duration = 3500 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  // Extract digits, prefixes, and suffixes (e.g. "$4.2M" -> prefix: "$", digits: "4.2", suffix: "M")
  const cleaned = targetValue.replace(/,/g, '')
  const match = cleaned.match(/^([$])?(\d+(\.\d+)?)([M+])?$/i)
  const prefix = match ? (match[1] || "") : ""
  const suffix = match ? (match[4] || "") : ""
  const numericValue = match ? parseFloat(match[2]) : parseFloat(cleaned) || 0

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!started) return

    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const currentValue = progress * numericValue
      
      if (numericValue % 1 === 0) {
        setCount(Math.floor(currentValue))
      } else {
        setCount(Number(currentValue.toFixed(1)))
      }

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(numericValue)
      }
    }

    window.requestAnimationFrame(step)
  }, [started, numericValue, duration])

  const formatDisplay = (val) => {
    if (isNaN(val)) return targetValue
    const formattedNum = val.toLocaleString("en-US", { maximumFractionDigits: 1 })
    return `${prefix}${formattedNum}${suffix}`
  }

  return <span ref={ref}>{formatDisplay(count)}</span>
}

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Describe your event",
    body: "Event type, crowd size, venue dimensions, and budget — plain language, no technical spec required.",
    badge: "Voice & Text",
  },
  {
    icon: Cpu,
    title: "AI generates the plan",
    body: "A full infrastructure spec — audio, lighting, staging, power — with quantities and a price range.",
    badge: "100% Custom",
  },
  {
    icon: Gavel,
    title: "Vendors bid",
    body: "Publish the plan to matched vendors, compare bids side by side, and accept the one that fits.",
    badge: "Secure Escrow",
  },
]

const FEATURES = [
  {
    icon: BrainCircuit,
    accent: "text-[#0891B2]",
    ring: "border-gray-150 hover:border-[#0891B2]/30 hover:shadow-lg",
    title: "AI Infrastructure Consultant",
    body: "Turns a vague event brief into a categorized, priced technical spec sheet in minutes — not a week of back-and-forth with a vendor.",
    badge: "AI Powered",
  },
  {
    icon: Store,
    accent: "text-[#059669]",
    ring: "border-gray-150 hover:border-[#059669]/30 hover:shadow-lg",
    title: "Vendor Bidding Marketplace",
    body: "Verified rental vendors bid directly on your generated plan. Compare price, notes, and rating in one comparable layout.",
    badge: "Verified Match",
  },
  {
    icon: Zap,
    accent: "text-amber-600",
    ring: "border-gray-150 hover:border-amber-500/30 hover:shadow-lg",
    title: "Instant Rental Mode",
    body: "Need gear in hours, not weeks? Search live availability by category and location, then book in one tap.",
    badge: "On Demand",
  },
]

function Landing() {
  const location = useLocation()
  const { user } = useAuth()
  
  const generatePlanPath = user 
    ? (user.role === "vendor" ? "/vendor/dashboard" : "/organizer/events/new")
    : "/register?role=organizer";

  const vendorPath = user 
    ? "/vendor/dashboard"
    : "/register?role=vendor";

  useEffect(() => {
    if (!location.hash) return
    const target = document.querySelector(location.hash)
    target?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [location.hash])

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-50 relative overflow-hidden border-b border-gray-100">
        <div className="absolute left-[15%] top-[10%] -z-10 h-72 w-72 rounded-full bg-[#0891B2]/5 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute right-[15%] bottom-[10%] -z-10 h-80 w-80 rounded-full bg-[#059669]/3 blur-[100px] pointer-events-none animate-pulse" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-start lg:py-28 lg:px-8">
          <ScrollReveal delay={100} className="z-10">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#0891B2] bg-[#0891B2]/5 border border-[#0891B2]/15 px-3 py-1.5 rounded-full inline-block">
              AI infrastructure consultant &amp; bidding marketplace
            </p>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">
              Describe your event.
              <br />
              Get a precise infrastructure plan.
            </h1>
            <p className="mt-5 max-w-lg font-body text-base text-gray-600 leading-relaxed">
              SoundScout turns a plain-language event brief into a full audio, lighting,
              staging, and power spec — then puts it in front of vendors ready to bid on it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to={generatePlanPath} variant="primary" size="lg" className="shadow-md hover:scale-[1.02] transition-transform">
                Generate a plan
              </Button>
              <Button as={Link} to={vendorPath} variant="outline" size="lg" className="border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:scale-[1.02] transition-transform">
                I'm a vendor
              </Button>
            </div>

            <div className="mt-12">
              <SignalPanel />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300} className="w-full max-w-md justify-self-center lg:justify-self-end relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#0891B2]/5 to-[#059669]/5 blur-xl opacity-75 pointer-events-none" />
            <SpecCard plan={heroPlan} loop className="relative w-full justify-self-center lg:justify-self-end border border-gray-200/80 shadow-lg hover:shadow-xl transition-shadow" />
          </ScrollReveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 bg-white border-b border-gray-100 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl font-semibold text-gray-900 tracking-tight">
              How it works
            </h2>
          </ScrollReveal>
          
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 150}>
                <div className="relative group bg-gray-50/50 border border-gray-100 p-6 rounded-lg hover:shadow-md transition-all duration-350 hover:-translate-y-1">
                  {/* Hover interactive pop up badge */}
                  <span className="absolute -top-2.5 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-[#0891B2] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
                    {step.badge}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0891B2]/20 bg-[#0891B2]/5 font-mono text-xs font-bold text-[#0891B2]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <step.icon size={18} className="text-[#059669]" strokeWidth={2} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 font-body text-sm text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 bg-gray-50 border-b border-gray-100 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl font-semibold text-gray-900 tracking-tight">
              Built for how events actually get planned
            </h2>
          </ScrollReveal>
          
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 150}>
                <div
                  className={`relative group rounded-lg bg-white border p-6 transition-all duration-350 ease-out hover:-translate-y-1 ${feature.ring}`}
                >
                  {/* Hover interactive pop up badge */}
                  <span className="absolute -top-2.5 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 bg-[#059669] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
                    {feature.badge}
                  </span>

                  <feature.icon size={24} className={feature.accent} strokeWidth={2} />
                  <h3 className="mt-5 font-display text-base font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 font-body text-sm text-gray-600 leading-relaxed">{feature.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats with count-up animations */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: "1,200+", label: "Plans generated" },
              { value: "340", label: "Verified vendors" },
              { value: "$4.2M", label: "Bids exchanged" },
              { value: "98%", label: "Organizer satisfaction" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 100}>
                <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-lg hover:shadow-sm transition-shadow">
                  <p className="font-mono text-3xl font-bold text-[#0891B2]">
                    <AnimatedCounter targetValue={stat.value} />
                  </p>
                  <p className="mt-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Landing
