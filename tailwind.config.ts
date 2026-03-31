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
        // Monochrome design token set
        black: "#000000",
        white: "#ffffff",
        grey: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        // Single accent token — dark charcoal for interactive elements
        accent: {
          DEFAULT: "#1a1a1a",
          hover: "#2d2d2d",
          light: "#3d3d3d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      lineHeight: {
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
      },
      spacing: {
        // 4px base unit spacing scale
        px: "1px",
        0: "0",
        0.5: "0.125rem",  // 2px
        1: "0.25rem",     // 4px
        1.5: "0.375rem",  // 6px
        2: "0.5rem",      // 8px
        2.5: "0.625rem",  // 10px
        3: "0.75rem",     // 12px
        3.5: "0.875rem",  // 14px
        4: "1rem",        // 16px
        5: "1.25rem",     // 20px
        6: "1.5rem",      // 24px
        7: "1.75rem",     // 28px
        8: "2rem",        // 32px
        9: "2.25rem",     // 36px
        10: "2.5rem",     // 40px
        11: "2.75rem",    // 44px — minimum touch target
        12: "3rem",       // 48px
        14: "3.5rem",     // 56px
        16: "4rem",       // 64px
        20: "5rem",       // 80px
        24: "6rem",       // 96px
        28: "7rem",       // 112px
        32: "8rem",       // 128px
        36: "9rem",       // 144px
        40: "10rem",      // 160px
        44: "11rem",      // 176px
        48: "12rem",      // 192px
        52: "13rem",      // 208px
        56: "14rem",      // 224px
        60: "15rem",      // 240px
        64: "16rem",      // 256px
        72: "18rem",      // 288px
        80: "20rem",      // 320px
        96: "24rem",      // 384px
      },
    },
  },
  plugins: [],
};

export default config;
