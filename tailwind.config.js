/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serifText: ['"DM Serif Text"', 'serif'],
        serifDisplay: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink: '#192618',
        ink2: '#020618',
        green: '#3D6E1F',
        brandRed: '#FF0000',
        chevbg: '#EDEDED',
        border1: '#D8D8D8',
        border2: '#D9D9D9',
        border3: '#F0F0F0',
        muted: '#868686',
      },
    },
  },
  plugins: [],
}
