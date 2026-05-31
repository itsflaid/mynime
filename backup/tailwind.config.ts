/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', "sans-serif"],
        dm: ['"DM Sans"', "sans-serif"],
      },
      colors: {
        pink: { DEFAULT: "#e91e8c", light: "#fce4f0", dark: "#c41574" },
        purple: { DEFAULT: "#7c3aed", light: "#ede9fe" },
      },
    },
  },
  plugins: [
  function({ addUtilities }: any) {
    addUtilities({
      '.scrollbar-hide': {
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      },
    })
  }
],
};
