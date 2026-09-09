import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: "#0d0d0d",
          panel: "#161616",
          panel2: "#202020",
          brass: "#22d3ee",       // neon cyan — active elements, headers
          brassLight: "#67e8f9",  // ice-blue highlight
          ember: "#dc2626",       // crimson — alerts/combat stats
          emerald: "#34d399",     // success/complete states
          emeraldDark: "#065f46",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "sans-serif"],
      },
      boxShadow: {
        pixel: "0 2px 10px rgba(0,0,0,0.65)",
        "pixel-sm": "0 1px 5px rgba(0,0,0,0.55)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
        rise: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        blink: "blink 1.4s steps(2, start) infinite",
        rise: "rise 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
