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
        // Primary command colors
        'cmd-dark': '#0a0a0f',
        'cmd-darker': '#050508',
        'cmd-panel': '#0d0d14',
        'cmd-border': '#1a1a2e',
        'cmd-accent': '#00d4ff',
        'cmd-accent-dim': '#007a99',

        // Threat level colors
        'threat-critical': '#ff0040',
        'threat-high': '#ff4400',
        'threat-elevated': '#ff8800',
        'threat-guarded': '#ffcc00',
        'threat-low': '#00cc44',

        // Agency colors
        'agency-intel': '#6366f1',
        'agency-defense': '#22c55e',
        'agency-cyber': '#00d4ff',
        'agency-law': '#f59e0b',
        'agency-foreign': '#8b5cf6',
        'agency-covert': '#ef4444',

        // Status colors
        'status-active': '#00ff88',
        'status-standby': '#ffaa00',
        'status-inactive': '#666666',
        'status-compromised': '#ff0055',
        'status-unknown': '#8844ff',

        // Classification colors
        'class-topsecret': '#ff0000',
        'class-secret': '#ff6600',
        'class-confidential': '#ffcc00',
        'class-unclassified': '#00cc00',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        'display': ['Orbitron', 'sans-serif'],
        'tactical': ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'threat-pulse': 'threat-pulse 1.5s ease-in-out infinite',
        'data-stream': 'data-stream 20s linear infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        'threat-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'data-stream': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)',
        'scan-lines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
}
