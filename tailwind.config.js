// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-light": "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        secondary: "var(--secondary)",
        tertiary: "var(--tertiary)",
      },
      fontFamily: {
        nunito: ["var(--font-nunito)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
