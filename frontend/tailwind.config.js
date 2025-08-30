// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0062B3',
          secondary: '#4A89CE',
          tertiary: '#61D5FF',
        },
      },
    },
  },
  plugins: [],
}
