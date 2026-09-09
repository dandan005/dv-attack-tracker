import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: "#160f0a",         // near-black warm brown, like the cave backdrop
          panel: "#2b1f16",      // dark stone/slot brown
          panel2: "#3d2b1d",     // lighter warm brown (gate stone)
          brass: "#f2b93a",      // glowing gold border color
          brassLight: "#ffd966", // bright gold highlight/glow
          ember: "#e8631c",      // warm orange accent (torch/fire)
          emerald: "#4ade80",    // success/complete states
          emeraldDark: "#166534",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "sans-serif"],
      },
      boxShadow: {
        pixel: "0 0 12px 2px rgba(242,185,58,0.55), 0 4px 14px rgba(0,0,0,0.6)",
        "pixel-sm": "0 0 6px 1px rgba(242,185,58,0.45), 0 2px 8px rgba(0,0,0,0.5)",
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
