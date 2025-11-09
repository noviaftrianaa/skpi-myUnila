import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px', // Extra small devices
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        myunila: {
          DEFAULT: '#0B5EA8',
          50: '#E6F2FA',
          100: '#CCE5F5',
          200: '#99CBEB',
          300: '#66B1E1',
          400: '#3397D7',
          500: '#0B5EA8',
          600: '#094B86',
          700: '#073864',
          800: '#052542',
          900: '#021220',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-blue-modern': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
        'gradient-sky': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
        'gradient-twilight': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    require('@tailwindcss/forms'),
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#eff6ff",
              100: "#dbeafe",
              200: "#bfdbfe",
              300: "#93c5fd",
              400: "#60a5fa",
              500: "#3b82f6",
              600: "#2563eb",
              700: "#1d4ed8",
              800: "#1e40af",
              900: "#1e3a8a",
              DEFAULT: "#3b82f6",
              foreground: "#ffffff",
            },
            secondary: {
              50: "#faf5ff",
              100: "#f3e8ff",
              200: "#e9d5ff",
              300: "#d8b4fe",
              400: "#c084fc",
              500: "#a855f7",
              600: "#9333ea",
              700: "#7e22ce",
              800: "#6b21a8",
              900: "#581c87",
              DEFAULT: "#a855f7",
              foreground: "#ffffff",
            },
            focus: "#3b82f6",
          },
        },
        dark: {
          colors: {
            primary: {
              50: "#1e3a8a",
              100: "#1e40af",
              200: "#1d4ed8",
              300: "#2563eb",
              400: "#3b82f6",
              500: "#60a5fa",
              600: "#93c5fd",
              700: "#bfdbfe",
              800: "#dbeafe",
              900: "#eff6ff",
              DEFAULT: "#3b82f6",
              foreground: "#ffffff",
            },
            secondary: {
              50: "#581c87",
              100: "#6b21a8",
              200: "#7e22ce",
              300: "#9333ea",
              400: "#a855f7",
              500: "#c084fc",
              600: "#d8b4fe",
              700: "#e9d5ff",
              800: "#f3e8ff",
              900: "#faf5ff",
              DEFAULT: "#a855f7",
              foreground: "#ffffff",
            },
            focus: "#3b82f6",
          },
        },
      },
    }),
  ],
};

export default config;
