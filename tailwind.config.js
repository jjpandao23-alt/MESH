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
        instagram: {
          purple: '#833ab4',
          red: '#fd1d1d',
          orange: '#fcb045',
          pink: '#e1306c',
          blue: '#0095f6',
          darkBg: '#0b0e14',
          darkCard: '#161b22',
          darkBorder: '#262d38',
          lightBg: '#fafafa',
          lightCard: '#ffffff',
          lightBorder: '#dbdbdb',
        },
      },
      fontFamily: {
        logo: ['Grand Hotel', 'Pacifico', 'cursive', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'radarPing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-slow': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)', boxShadow: '0 0 12px rgba(253, 29, 29, 0.8)' },
          '50%': { opacity: 0.6, transform: 'scale(1.15)', boxShadow: '0 0 20px rgba(131, 58, 180, 0.9)' },
        },
        radarPing: {
          '0%': { transform: 'scale(0.2)', opacity: 0.9 },
          '80%, 100%': { transform: 'scale(2.4)', opacity: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
    },
  },
  plugins: [],
}
