/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        minecraft: {
          dark: '#1a1a1a',
          stone: '#7f7f7f',
          dirt: '#8b6914',
          grass: '#5a8c32',
          wood: '#6b5344',
          leaves: '#2d5a27',
          water: '#3366cc',
          sand: '#e8d4a8',
          snow: '#f0f0f0'
        }
      },
      fontFamily: {
        minecraft: ['Minecraft', 'monospace']
      }
    },
  },
  plugins: [],
}
