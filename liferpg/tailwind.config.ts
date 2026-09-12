import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#14110D",
          900: "#1B1712",
          800: "#241F18",
          700: "#332B20",
        },
        parchment: {
          100: "#F6EFDD",
          200: "#EFE4C6",
          300: "#E8DCC0",
          400: "#D8C79E",
        },
        seal: {
          DEFAULT: "#A6321E",
          dark: "#7E2515",
          light: "#C4482F",
        },
        brass: {
          DEFAULT: "#C9A227",
          light: "#E0BE52",
          dark: "#8F721A",
        },
        moss: {
          DEFAULT: "#3F6E52",
          light: "#5C9270",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        card: "0 6px 0 rgba(20,17,13,0.35), 0 12px 24px rgba(0,0,0,0.35)",
        pin: "0 2px 4px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
