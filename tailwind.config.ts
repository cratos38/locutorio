import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Connect theme colors
        primary: {
          DEFAULT: "#2bee79",
          foreground: "#102217",
        },
        "connect-bg": {
          light: "#f6f8f7",
          dark: "#102217",
        },
        "connect-card": "#1c2720",
        "connect-border": "#28392f",
        "connect-muted": "#9db9a8",
        // Forest theme colors (for messages window)
        "forest-base": "#1A5319",
        "forest-dark": "#0d2b0d",
        "forest-panel": "#144214",
        "forest-light": "#2e7d32",
        "forest-accent": "#388e3c",
        "neon-green": "#50fa7b",
        "neon-hover": "#69ff94",
        "text-light": "#e2e8f0",
        "text-muted": "#86efac",
        "bubble-sent": "#1b4d1b",
        "bubble-received": "#2e7d32",
        // Original theme colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Spline Sans", "sans-serif"],
        sans: ["Lato", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
