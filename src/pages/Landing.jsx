import { Link } from "react-router-dom"
import { BrainCircuit, Store, Zap, MessageSquareText, Cpu, Gavel } from "lucide-react"
import Button from "../components/Button"
import SpecCard from "../components/SpecCard"
import CountUpStat from "../components/CountUpStat"
import { heroPlan } from "../services/mockData"

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Describe your event",
    body: "Event type, crowd size, venue dimensions, and budget — plain language, no technical spec required.",
  },
  {
    icon: Cpu,
    title: "AI generates the plan",
    body: "A full infrastructure spec — audio, lighting, staging, power — with quantities and a price range.",
  },
  {
    icon: Gavel,
    title: "Vendors bid",
    body: "Publish the plan to matched vendors, compare bids side by side, and accept the one that fits.",
  },
]

const FEATURES = [
  {
    icon: BrainCircuit,
    accent: "text-signal-amber",
    ring: "border-signal-amber/30",
    title: "AI Infrastructure Consultant",
    body: "Turns a vague event brief into a categorized, priced technical spec sheet in minutes — not a week of back-and-forth with a vendor.",
  },
  {
    icon: Store,
    accent: "text-circuit-teal",
    ring: "border-circuit-teal/30",
    title: "Vendor Bidding Marketplace",
    body: "Verified rental vendors bid directly on your generated plan. Compare price, notes, and rating in one comparable layout.",
  },
  {
    icon: Zap,
    accent: "text-alert-red",
    ring: "border-alert-red/30",
    title: "Instant Rental Mode",
    body: "Need gear in hours, not weeks? Search live availability by category and location, then book in one tap.",
  },
]

function Landing() {
  return (
    <>
      {/* Hero */}
      <section
        className="bg-ink-navy"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 120% 100% at 0% 0%, #1c1c42 0%, #12122B 55%), linear-gradient(rgba(247,245,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(247,245,241,0.05) 1px, transparent 1px)",
          backgroundSize: "auto, 32px 32px, 32px 32px",
        }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-start lg:py-28 lg:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-signal-amber">
              AI infrastructure consultant &amp; bidding marketplace
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-paper sm:text-5xl">
              Describe your event.
              <br />
              Get a precise infrastructure plan.
            </h1>
            <p className="mt-5 max-w-lg font-body text-base text-paper/60">
              SoundScout turns a plain-language event brief into a full audio, lighting,
              staging, and power spec — then puts it in front of vendors ready to bid on it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/register" variant="primary" size="lg">
                Generate a plan
              </Button>
              <Button as={Link} to="/register" variant="outline" size="lg">
                I'm a vendor
              </Button>
            </div>

            {/* Placeholder figures for the competition demo; replace with real metrics once available */}
            <div className="mt-14 flex divide-x divide-paper/10 border-t border-paper/10 pt-8">
              <div className="pr-8">
                <CountUpStat value={1200} suffix="+" label="Plans generated" />
              </div>
              <div className="px-8">
                <CountUpStat value={340} suffix="+" label="Verified vendors" />
              </div>
              <div className="pl-8">
                <CountUpStat value={4} suffix=" min" label="Avg. plan time" />
              </div>
            </div>
          </div>

          <SpecCard plan={heroPlan} loop className="w-full max-w-md justify-self-center lg:justify-self-end" />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-ink-navy sm:text-3xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-ink-navy font-mono text-sm font-semibold text-signal-amber">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <step.icon size={20} className="text-circuit-teal" strokeWidth={2} />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-navy">
                  {step.title}
                </h3>
                <p className="mt-2 font-body text-sm text-slate">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate/10 bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-ink-navy sm:text-3xl">
            Built for how events actually get planned
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-md border bg-white/60 p-6 transition-colors duration-150 ease-out hover:bg-white ${feature.ring}`}
              >
                <feature.icon size={24} className={feature.accent} strokeWidth={2} />
                <h3 className="mt-4 font-display text-base font-semibold text-ink-navy">
                  {feature.title}
                </h3>
                <p className="mt-2 font-body text-sm text-slate">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — placeholder figures for the competition demo; replace with real metrics once available */}
      <section className="bg-ink-navy">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: "1,200+", label: "Plans generated" },
              { value: "340", label: "Verified vendors" },
              { value: "$4.2M", label: "Bids exchanged" },
              { value: "98%", label: "Organizer satisfaction" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-2xl font-semibold text-signal-amber sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 font-body text-xs uppercase tracking-wide text-paper/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Landing
