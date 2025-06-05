/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      spacing: {
        128: '32rem',
      },
      transitionDuration: {
        250: '250ms',
      },
      boxShadow: {
        soft: '0 8px 32px rgba(0,0,0,0.05)',
        'inner-xl': 'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
