import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: { xs: "475px" },
      colors: {
        myunila: {
          DEFAULT: "#0B5EA8",
          50: "#E6F2FA",
          100: "#CCE5F5",
          200: "#99CBEB",
          300: "#66B1E1",
          400: "#3397D7",
          500: "#0B5EA8",
          600: "#094B86",
          700: "#073864",
          800: "#052542",
          900: "#021220",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        display: ["var(--font-poppins)", "var(--font-inter)", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "72ch",
            color: "inherit",
            a: { color: "#0B5EA8", "&:hover": { color: "#073864" } },
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
