function Landing() {
  return (
    <section className="bg-ink-navy">
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-signal-amber">
          Step 1 — base layout &amp; nav
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-paper sm:text-5xl">
          The hero &amp; spec-card come in step 2
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-body text-paper/60">
          This placeholder just confirms the nav, footer, colors, and fonts are wired up
          correctly before we build the real landing page.
        </p>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { name: "Ink Navy", className: "bg-ink-navy border border-paper/20" },
            { name: "Paper", className: "bg-paper" },
            { name: "Signal Amber", className: "bg-signal-amber" },
            { name: "Circuit Teal", className: "bg-circuit-teal" },
            { name: "Alert Red", className: "bg-alert-red" },
          ].map((swatch) => (
            <div key={swatch.name} className="flex flex-col items-center gap-2">
              <div className={`h-14 w-14 rounded ${swatch.className}`} />
              <span className="font-mono text-[11px] text-paper/60">{swatch.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Landing
