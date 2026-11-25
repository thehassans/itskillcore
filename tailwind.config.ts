import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        container: "1280px",
      },
      animation: {
        marquee: "marquee var(--duration, 40s) linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap, 1rem)))" },
        },
      },
      colors: {
        background: "var(--background, #f8faf9)",
        foreground: "var(--foreground, #063F38)",
        muted: {
          DEFAULT: "#f1f5f3",
          foreground: "#52635e",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#063F38",
        },
        border: "#e2eae6",
        primary: {
          DEFAULT: "#063F38",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#F4FFE2",
          foreground: "#063F38",
        },
        accent: {
          DEFAULT: "#C9FA52",
          foreground: "#063F38",
        },
        brand: {
          pine: "#063F38",
          "pine-dark": "#042b26",
          lime: "#C9FA52",
          cream: "#F4FFE2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
