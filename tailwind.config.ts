import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: "#080a18",
          panel: "#11172b",
          panel2: "#1b2442",
          brass: "#c98a3e",
          brassLight: "#ffe3a1",
          ember: "#ff6d6d",
          emerald: "#78e8c7",
          emeraldDark: "#12675d",
          violet: "#8b7dff",
          line: "#3b4975",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "sans-serif"],
      },
      boxShadow: {
        pixel: "0 3px 0 0 rgba(5,6,17,0.95), 0 10px 26px rgba(2,4,14,0.28)",
        "pixel-sm": "0 2px 0 0 rgba(5,6,17,0.95)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.45" } },
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
