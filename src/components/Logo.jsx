import React from "react"

function Logo({ dark = true }) {
  // dark=true means the logo text should be dark (for light theme backgrounds)
  const textColor = dark ? "text-slate-900" : "text-white"

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon: Wave + Dial */}
      <svg className="w-9 h-7.5" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-cyan" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Professional Teal wave path */}
        <path 
          d="M 5 30 Q 12 25 15 20 Q 18 10 21 30 Q 24 50 27 15 Q 30 -10 33 35 Q 36 65 39 30 T 45 30 H 52" 
          stroke="#0891B2" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#glow-cyan)"
        />
        
        {/* Professional Emerald circular dial */}
        <circle 
          cx="62" 
          cy="30" 
          r="18" 
          stroke="#059669" 
          strokeWidth="3.2" 
          strokeDasharray="80 30" 
          strokeLinecap="round"
          transform="rotate(-45 62 30)"
        />
        
        {/* Inner dial indicator line */}
        <line 
          x1="62" 
          y1="30" 
          x2="72" 
          y2="20" 
          stroke="#0891B2" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
      </svg>

      {/* Brand text */}
      <div className="flex flex-col leading-none">
        <span className={`font-display text-[12.5px] font-extrabold tracking-wider uppercase ${textColor}`}>
          SOUNDSCOUT <span className="text-[#059669]">AI</span>
        </span>
        <span className="mt-0.5 font-mono text-[6.5px] font-bold uppercase tracking-[0.2em] text-[#0891B2]">
          AUDIO LOGISTICS
        </span>
      </div>
    </div>
  )
}

export default Logo
