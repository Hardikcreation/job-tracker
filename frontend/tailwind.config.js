/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Cabinet Grotesk"', "system-ui", "sans-serif"],
        body: ['"Work Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        brutal: {
          yellow: "#FFDE59",
          lavender: "#E8D5F2",
          mint: "#B5EAD7",
          pink: "#FF9AA2",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #0A0A0A",
        "brutal-lg": "8px 8px 0px 0px #0A0A0A",
      },
    },
  },
  plugins: [],
};
