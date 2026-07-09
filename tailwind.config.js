/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: '#0E7C86',
        'teal-2': '#14A3AF',
        amber: '#C98A2C',
        rose: '#B5484F',
        green: '#3F8F5F'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
