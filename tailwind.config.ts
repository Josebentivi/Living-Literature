import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "html.dark"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#1F2937",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
        },
        text: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          subtle: "rgb(var(--text-subtle) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          strong: "rgb(var(--accent-strong) / <alpha-value>)",
          warm: "rgb(var(--accent-warm) / <alpha-value>)",
        },
      },
      boxShadow: {
        glow: "0 12px 42px rgba(37, 99, 235, 0.26)",
      },
      backgroundImage: {
        gradientHero:
          "linear-gradient(130deg, rgba(37, 99, 235, 0.92), rgba(79, 70, 229, 0.88), rgba(30, 64, 175, 0.9))",
      },
    },
  },
  plugins: [],
};

export default config;
