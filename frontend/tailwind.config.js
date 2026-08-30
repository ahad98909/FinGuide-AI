/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f4f6f4',
          100: '#e5ebe6',
          200: '#cbdad0',
          300: '#a3bead',
          400: '#759981',
          500: '#527c60',
          600: '#3e624a',
          700: '#324e3c',
          800: '#2a4032',
          900: '#1b321f', // Main dark green
          950: '#112014',
        },
        cream: {
          50: '#faf9f5',
          100: '#f4f3ed',
          200: '#e6e4d7',
          300: '#d0cebb',
          400: '#b4b097',
          500: '#9b977b',
          600: '#7c785f',
          750: '#2b2a24',
        },
        primary: {
          50: '#f4f6f4',
          100: '#e5ebe6',
          200: '#cbdad0',
          300: '#a3bead',
          400: '#759981',
          500: '#324e3c', // Override primary with forest green
          600: '#1b321f',
          700: '#112014',
        }
      },
    },
  },
  plugins: [],
}
