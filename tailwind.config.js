/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "ink-navy": "#12122B",
        paper: "#F7F5F1",
        "signal-amber": "#FFB020",
        "circuit-teal": "#1F8A70",
        slate: "#5C5C6E",
        "alert-red": "#E5484D",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
      },
      spacing: {
        18: "4.5rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "reveal-line": {
          "0%": { opacity: 0, transform: "translateX(-6px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        "eq-bounce": {
          "0%, 100%": { transform: "scaleY(0.2)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out forwards",
        "reveal-line": "reveal-line 250ms ease-out forwards",
        "eq-bounce": "eq-bounce 1.2s ease-in-out infinite",
      },
      transitionDuration: {
        150: "150ms",
        300: "300ms",
      },
    },
  },
  plugins: [],
}
