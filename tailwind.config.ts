import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: "#1c130b",
          panel: "#2a1e13",
          panel2: "#38291a",
          brass: "#a9782f",
          brassLight: "#d4af37",
          ember: "#7a2618",
          emerald: "#3f7a5c",
          emeraldDark: "#16332a",
        },
      },
      fontFamily: {
        fantasy: ["var(--font-fantasy)", "serif"],
      },
      boxShadow: {
        pixel: "0 6px 16px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(212,175,55,0.25)",
        "pixel-sm": "0 3px 8px rgba(0,0,0,0.45)",
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
