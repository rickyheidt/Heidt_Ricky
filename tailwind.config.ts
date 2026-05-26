import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#f5f1e8",
          dark: "#e8e0d0",
        },
        forest: {
          DEFAULT: "#1a4d3a",
          light: "#2d6e54",
        },
        gold: {
          DEFAULT: "#c4943c",
          light: "#d4a84c",
        },
        ink: "#1a1a1a",
        muted: "#8a7d6a",
      },
      fontFamily: {
        fraunces: ["Fraunces", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-up": "fadeUp 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      boxShadow: {
        card: "0 2px 16px rgba(26,26,26,0.08)",
        "card-hover": "0 8px 32px rgba(26,26,26,0.12)",
        bottom: "0 -1px 0 rgba(26,26,26,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
