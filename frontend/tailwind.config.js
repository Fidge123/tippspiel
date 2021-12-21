module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    screens: {
      sm: "448px",
      md: "720px",
    },
    extend: {
      rotate: {
        "-135": "-135deg",
      },
      borderWidth: {
        3: "3px",
      },
      width: {
        "21r": "21rem",
        "23r": "23rem",
        "27r": "27rem",
        "39r": "39rem",
        "7r": "7rem",
        "8.5r": "8.5rem",
        "14.5r": "14.5rem",
      },
      gridTemplateColumns: {
        23: "repeat(auto-fill, minmax(23rem, 1fr))",
        27: "repeat(auto-fill, minmax(27rem, 1fr))",
        45: "repeat(auto-fill, minmax(45rem, 1fr))",
      },
    },
  },
  variants: {
    extend: {
      textColor: ["disabled"],
      pointerEvents: ["disabled"],
      backgroundColor: ["disabled", "dark"],
      opacity: ["disabled", "dark"],
    },
  },
  plugins: [],
};
