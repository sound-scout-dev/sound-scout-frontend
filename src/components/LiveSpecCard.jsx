import { useState, useEffect, useRef } from 'react';
import { heroSpecCardData } from '../data/mockData';

/**
 * LiveSpecCard — The signature visual element.
 * Visually assembles an infrastructure plan line by line on load,
 * simulating "watching the AI think."
 */
export default function LiveSpecCard() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showPrice, setShowPrice] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const cardRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startAnimation();
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const startAnimation = () => {
    // Show header first
    setTimeout(() => setHeaderVisible(true), 200);

    // Then reveal each equipment line with stagger
    const totalItems = heroSpecCardData.equipment.length;
    for (let i = 0; i < totalItems; i++) {
      setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, 700 + i * 350);
    }

    // Finally reveal price
    setTimeout(() => {
      setShowPrice(true);
    }, 700 + totalItems * 350 + 400);
  };

  return (
    <div
      ref={cardRef}
      className="w-full max-w-xl mx-auto bg-ink-navy-light/50 border border-white/[0.08] rounded-lg overflow-hidden backdrop-blur-sm"
    >
      {/* Card header — event info */}
      <div
        className={`px-5 py-4 border-b border-white/[0.06] transition-all duration-500 ${
          headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-signal-amber animate-pulse-soft" />
          <span className="text-signal-amber text-xs font-mono uppercase tracking-wider">
            AI Generating Plan
          </span>
        </div>
        <p className="text-white font-display font-semibold text-lg">
          {heroSpecCardData.eventType}
        </p>
        <p className="text-white/50 text-sm font-mono">
          {heroSpecCardData.crowdSize} attendees
        </p>
      </div>

      {/* Equipment lines */}
      <div className="px-5 py-3">
        {/* Column headers */}
        <div
          className={`grid grid-cols-[1fr_auto_auto] gap-x-4 text-[11px] font-mono uppercase tracking-wider text-white/25 pb-2 mb-2 border-b border-white/[0.04] transition-all duration-500 ${
            headerVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>Equipment</span>
          <span className="text-right">Qty</span>
          <span className="text-right w-12">Unit</span>
        </div>

        {heroSpecCardData.equipment.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-[1fr_auto_auto] gap-x-4 py-2 border-b border-white/[0.03] last:border-0 transition-all duration-400 ${
              index < visibleLines
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-3'
            }`}
            style={{
              transitionDelay: `${index * 50}ms`,
            }}
          >
            <div>
              <p className="text-white text-sm font-medium">{item.name}</p>
              <p className="text-white/40 text-xs font-mono">{item.spec}</p>
            </div>
            <span className="text-white/80 text-sm font-mono text-right tabular-nums self-center">
              {item.qty}
            </span>
            <span className="text-white/40 text-xs font-mono text-right w-12 self-center">
              {item.unit}
            </span>
          </div>
        ))}
      </div>

      {/* Price range — reveals last */}
      <div
        className={`px-5 py-4 border-t border-white/[0.06] bg-signal-amber/[0.04] transition-all duration-800 ${
          showPrice ? 'opacity-100' : 'opacity-0 blur-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs font-mono uppercase tracking-wider">
            Estimated Range
          </span>
          <span className="text-signal-amber font-mono font-semibold text-lg tracking-tight">
            {heroSpecCardData.estimatedRange}
          </span>
        </div>
      </div>
    </div>
  );
}
