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
        corporate: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
          950: "#0b1d30",
        },
        brand: {
          DEFAULT: "#0F2942", // Azul infraestructura profundo
          hover: "#18395B",
          accent: "#2563EB",  // Acento corporativo tecnológico
          amber: "#D97706",   // Acento de obra / construcción sobrio
        },
        severity: {
          high: {
            text: "#991B1B",
            bg: "#FEF2F2",
            border: "#FCA5A5",
            dot: "#EF4444",
          },
          medium: {
            text: "#92400E",
            bg: "#FFFBEB",
            border: "#FCD34D",
            dot: "#F59E0B",
          },
          low: {
            text: "#065F46",
            bg: "#ECFDF5",
            border: "#A7F3D0",
            dot: "#10B981",
          },
        },
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
        dropdown: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
