import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: "#14100b",
          panel: "#241d15",
          panel2: "#322820",
          brass: "#e8a33d",
          brassLight: "#f5c563",
          ember: "#e5484d",
          emerald: "#5eead4",
          emeraldDark: "#0f766e",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "sans-serif"],
      },
      boxShadow: {
        pixel: "0 3px 0 0 rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)",
        "pixel-sm": "0 2px 0 0 rgba(0,0,0,0.5)",
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
