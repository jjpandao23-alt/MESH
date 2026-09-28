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
        neo: {
          yellow: '#ffe600',
          pink: '#ff007f',
          green: '#00ff66',
          cyan: '#00f0ff',
          purple: '#a855f7',
          orange: '#ff6600',
          red: '#ff2a2a',
          bgDark: '#121212',
          cardDark: '#1a1a1a',
          bgLight: '#f4f0ea',
          cardLight: '#ffffff',
        },
        instagram: {
          purple: '#833ab4',
          red: '#fd1d1d',
          orange: '#fcb045',
          pink: '#e1306c',
          blue: '#0095f6',
        },
      },
      boxShadow: {
        neo: '4px 4px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-yellow': '4px 4px 0px 0px #ffe600',
        'neo-pink': '4px 4px 0px 0px #ff007f',
        'neo-cyan': '4px 4px 0px 0px #00f0ff',
        'neo-green': '4px 4px 0px 0px #00ff66',
        'neo-white': '4px 4px 0px 0px #ffffff',
      },
      fontFamily: {
        logo: ['Grand Hotel', 'Pacifico', 'cursive', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Space Mono', 'Courier New', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
    },
  },
  plugins: [],
}
