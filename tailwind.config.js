/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFF9FB',
          100: '#FDF2F5',
          200: '#F9E3EA',
          300: '#F2CBD7',
          400: '#E4A6BA',
          500: '#A9748A',
        },
        charcoal: {
          DEFAULT: '#3E2433',
          light: '#5C3B4D',
          muted: '#8C6578',
        },
        terracotta: {
          DEFAULT: '#D0628A',
          light: '#E487A8',
          dark: '#B0466F',
        },
        gold: {
          DEFAULT: '#D9A3A0',
          light: '#EBC2BE',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 40s linear infinite',
        'fade-in': 'fadeIn 0.7s ease forwards',
        'slide-up': 'slideUp 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-in-right': 'slideInRight 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(36px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
