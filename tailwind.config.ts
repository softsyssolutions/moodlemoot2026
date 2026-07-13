import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          navy: "hsl(var(--brand-navy))",
          orange: "hsl(var(--brand-orange))",
          ink: "hsl(var(--brand-ink))",
          yellow: "hsl(var(--brand-yellow))",
          bronze: "hsl(var(--brand-bronze))",
          bg: "hsl(var(--brand-bg))",
          dark: "hsl(var(--brand-dark))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ["Sansation", "system-ui", "sans-serif"],
        display: ["Sansation", "system-ui", "sans-serif"],
        mono: ["Sansation", "system-ui", "sans-serif"],
        serif: ["Sansation", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 0.5rem)",
        sm: "calc(var(--radius) - 0.75rem)",
        brand: "1.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-up": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-120px) scale(1.5)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "count-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "float-slow": {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(20px, -15px)" },
          "50%": { transform: "translate(-10px, -25px)" },
          "75%": { transform: "translate(-20px, 10px)" },
          "100%": { transform: "translate(0, 0)" },
        },
        "float-slow-reverse": {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(-15px, 20px)" },
          "50%": { transform: "translate(25px, 10px)" },
          "75%": { transform: "translate(10px, -20px)" },
          "100%": { transform: "translate(0, 0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bell-wiggle": {
          "0%, 92%, 100%": { transform: "rotate(0deg)" },
          "93%": { transform: "rotate(-14deg)" },
          "95%": { transform: "rotate(12deg)" },
          "97%": { transform: "rotate(-8deg)" },
          "99%": { transform: "rotate(4deg)" },
        },
        "button-nudge": {
          "0%, 86%, 100%": { transform: "translateY(0)" },
          "90%": { transform: "translateY(-3px)" },
          "94%": { transform: "translateY(1px)" },
          "97%": { transform: "translateY(-1px)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-up": "float-up 2s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "reveal-up": "reveal-up 0.8s ease-out both",
        "bell-wiggle": "bell-wiggle 3.5s ease-in-out infinite",
        "button-nudge": "button-nudge 5s ease-in-out infinite",

        "count-pulse": "count-pulse 2s ease-in-out infinite",
        "float-slow": "float-slow 15s ease-in-out infinite",
        "float-slow-reverse": "float-slow-reverse 18s ease-in-out infinite",
        marquee: "marquee 35s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        "marquee-reverse": "marquee-reverse 45s linear infinite",
        "reveal-up": "reveal-up 0.8s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
