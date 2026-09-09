import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dv: {
          bg: "#12100e",
          panel: "#1c1712",
          panel2: "#241d16",
          brass: "#a9702f",
          brassLight: "#c98a44",
          ember: "#e67e22",
          emerald: "#6ee7b7",
          emeraldDark: "#1e4d3a",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px rgba(0,0,0,0.55)",
        "pixel-sm": "2px 2px 0px 0px rgba(0,0,0,0.5)",
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
