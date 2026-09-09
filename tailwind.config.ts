import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: "#120a1a",
          panel: "#1e1230",
          panel2: "#2a1a42",
          brass: "#f2c14e",
          brassLight: "#ffe27a",
          ember: "#ff4d4d",
          emerald: "#7cf29c",
          emeraldDark: "#1c8a4a",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px rgba(0,0,0,0.6)",
        "pixel-sm": "2px 2px 0px 0px rgba(0,0,0,0.55)",
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
