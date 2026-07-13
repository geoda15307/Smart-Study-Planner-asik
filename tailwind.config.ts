import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        soft: "#f7f8fb",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8"
        }
      },
      boxShadow: {
        soft: "0 16px 45px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        card: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
