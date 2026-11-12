/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        aldrich: ['Aldrich', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Open Sans', 'Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          amber: '#F59E0B',
          amberHover: '#D97706',
          amberLight: '#FDE68A',
          gold: '#FFBF00',
          dark: '#0A0A0A',
          card: '#141416',
          cardHover: '#1C1C20',
          border: '#27272A',
          muted: '#A1A1AA',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

