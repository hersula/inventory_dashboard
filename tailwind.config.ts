import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6fe",
          200: "#bfd2fe",
          300: "#93b2fd",
          400: "#6089fa",
          500: "#3d63f5",
          600: "#2843ea",
          700: "#2131d6",
          800: "#2129ad",
          900: "#212a89",
          950: "#181c53",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16,24,40,0.06), 0 1px 3px 0 rgba(16,24,40,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
