/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'holo-blue': '#00f0ff',
        'holo-cyan': '#00ffea',
        'holo-purple': '#b347ff',
        'holo-pink': '#ff47ab',
        'holo-green': '#00ff88',
        'holo-orange': '#ff8800',
        'holo-red': '#ff3355',
        'holo-yellow': '#ffee00',
        'space-dark': '#0a0a12',
        'space-darker': '#050508',
        'space-blue': '#0d1a2d',
        'space-purple': '#1a0d2e',
        'panel-bg': 'rgba(10, 20, 40, 0.85)',
        'panel-border': 'rgba(0, 240, 255, 0.3)',
        'panel-glow': 'rgba(0, 240, 255, 0.1)',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'display': ['Orbitron', 'sans-serif'],
        'system': ['Exo 2', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'float': 'float 6s ease-in-out infinite',
        'rotate-slow': 'rotate 20s linear infinite',
        'data-stream': 'data-stream 2s linear infinite',
        'alert-pulse': 'alert-pulse 1s ease-in-out infinite',
        'hologram': 'hologram 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.8, filter: 'brightness(1.3)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'flicker': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.95 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'data-stream': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        'alert-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        'hologram': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '33%': { opacity: 0.95, transform: 'scale(1.002)' },
          '66%': { opacity: 0.98, transform: 'scale(0.998)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'holo': '0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(0, 240, 255, 0.1)',
        'holo-strong': '0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2)',
        'alert': '0 0 20px rgba(255, 51, 85, 0.5)',
        'success': '0 0 20px rgba(0, 255, 136, 0.5)',
      },
    },
  },
  plugins: [],
}
