/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arc: {
          bg: '#0a192f',
          card: '#112240',
          border: '#1e3a8a',
          accent: '#f97316',
          text: '#f8fafc',
          muted: '#94a3b8'
        }
      },
    },
  },
  plugins: [],
}
