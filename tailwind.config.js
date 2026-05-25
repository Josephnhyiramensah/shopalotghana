/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FFA07A",
          secondary: "#1D3557",
          accent: "#F4A261",
          light: "#F1FAEE",
        },
      },
    },
  },
  plugins: [],
}