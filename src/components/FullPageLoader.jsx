import React from "react"

function FullPageLoader({ message = "LOADING SYSTEMS..." }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f1f5f9] dark:bg-[#121212] animate-modal-backdrop">
      <div className="flex flex-col items-center gap-6 scale-125">
        {/* Animated logo drawing container */}
        <div className="relative flex items-center justify-center">
          <svg className="w-24 h-24" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow-cyan-loader" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <style>{`
                .animate-draw-path {
                  stroke-dasharray: 200;
                  stroke-dashoffset: 200;
                  animation: drawPath 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                .animate-draw-circle {
                  stroke-dasharray: 120;
                  stroke-dashoffset: 120;
                  animation: drawCircle 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                  animation-delay: 0.3s;
                }
                .animate-draw-line {
                  stroke-dasharray: 30;
                  stroke-dashoffset: 30;
                  animation: drawLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                  animation-delay: 0.6s;
                }
                .pulse-logo {
                  animation: pulseText 2s ease-in-out infinite;
                }
                @keyframes drawPath {
                  0% { stroke-dashoffset: 200; }
                  50% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: -200; }
                }
                @keyframes drawCircle {
                  0% { stroke-dashoffset: 120; }
                  50% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: -120; }
                }
                @keyframes drawLine {
                  0% { stroke-dashoffset: 30; }
                  50% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: -30; }
                }
                @keyframes pulseText {
                  0%, 100% { opacity: 0.6; transform: scale(0.98); }
                  50% { opacity: 1; transform: scale(1.02); }
                }
              `}</style>
            </defs>
            
            {/* Wave */}
            <path 
              d="M 5 30 Q 12 25 15 20 Q 18 10 21 30 Q 24 50 27 15 Q 30 -10 33 35 Q 36 65 39 30 T 45 30 H 52" 
              stroke="#0891B2" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#glow-cyan-loader)"
              className="animate-draw-path"
            />
            
            {/* Circle dial */}
            <circle 
              cx="62" 
              cy="30" 
              r="18" 
              stroke="#059669" 
              strokeWidth="3.2" 
              strokeLinecap="round"
              className="animate-draw-circle"
              transform="rotate(-45 62 30)"
            />
            
            {/* Inner dial line */}
            <line 
              x1="62" 
              y1="30" 
              x2="72" 
              y2="20" 
              stroke="#0891B2" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              className="animate-draw-line"
            />
          </svg>
        </div>

        {/* Text indicators */}
        <div className="flex flex-col items-center leading-none text-center pulse-logo">
          <span className="font-display text-base font-extrabold tracking-wider uppercase text-gray-900">
            SOUNDSCOUT <span className="text-[#059669]">AI</span>
          </span>
          <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#0891B2]">
            AUDIO LOGISTICS
          </span>
          <p className="mt-4 font-mono text-[9px] text-gray-400 animate-pulse tracking-widest uppercase">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FullPageLoader
