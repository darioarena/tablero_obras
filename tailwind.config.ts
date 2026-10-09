import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        brand: {
          DEFAULT: "#0F2942",
          hover: "#18395B",
          accent: "#2563EB",
          amber: "#D97706",
        },
        severity: {
          high: {
            text: "#991B1B",
            bg: "#FEF2F2",
            border: "#FCA5A5",
          },
          medium: {
            text: "#92400E",
            bg: "#FFFBEB",
            border: "#FCD34D",
          },
          low: {
            text: "#065F46",
            bg: "#ECFDF5",
            border: "#A7F3D0",
          },
        },
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
