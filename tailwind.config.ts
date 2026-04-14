import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F0F1A",
          50: "#1A1A2E",
          100: "#16162B",
          200: "#121225",
          300: "#0F0F1A",
          400: "#0A0A12",
          500: "#07070D",
        },
        purple: {
          DEFAULT: "#7F77DD",
          50: "#E8E6F8",
          100: "#D1CDF1",
          200: "#B3ADE8",
          300: "#9E96E2",
          400: "#7F77DD",
          500: "#6058C4",
          600: "#4A43A3",
        },
        teal: {
          DEFAULT: "#1D9E75",
          50: "#E6F7F1",
          100: "#B3E8D4",
          200: "#80D9B7",
          300: "#4DCA9A",
          400: "#1D9E75",
          500: "#167A5B",
          600: "#105641",
        },
        coral: {
          DEFAULT: "#D85A30",
          50: "#FBEEE8",
          100: "#F2C9B8",
          200: "#E9A488",
          300: "#D85A30",
          400: "#B84A28",
          500: "#983A1F",
        },
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s infinite",
        "confetti": "confetti 0.5s ease-out",
        "progress": "progress 1s ease-out",
        "bounce-in": "bounceIn 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(127, 119, 221, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(127, 119, 221, 0.6)" },
        },
        confetti: {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(360deg)", opacity: "0" },
        },
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
