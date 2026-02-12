import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F0',
          100: '#FFE8DB',
          200: '#FFD0B8',
          300: '#FFB088',
          400: '#FF8A65',
          500: '#FF6B6B',
          600: '#E85555',
          700: '#C94040',
          800: '#A33333',
          900: '#7D2828',
        },
        warm: {
          50: '#FFF9F0',
          100: '#FFF5E6',
          200: '#FFEFD5',
        }
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'progress-shine': 'progress-shine 2s infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'confetti': 'confetti-fall 3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 138, 101, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 138, 101, 0.5)' },
        },
        'progress-shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
