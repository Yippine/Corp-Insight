/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#bdd4ff',
          200: '#94b8ff',
          300: '#6b9cff',
          400: '#4280ff',
          500: '#1864ff',
          600: '#0047e1',
          700: '#0034a3',
          800: '#002165',
          900: '#000e27',
        },
      },
    },
  },
  plugins: [],
}