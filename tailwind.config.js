import animate from 'tailwindcss-animate';
import primeui from 'tailwindcss-primeui';

/** @type {import("tailwindcss").Config} */
export default {
  darkMode: ['class'],
  safelist: ['dark'],
  prefix: '',

  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        primary: '#0F52FF',
        secondary: '#5BD0F4'
      },
      fontFamily: {
        sans: ['Figtree', 'inter', 'sans-serif']
      }
    }
  },

  plugins: [animate, primeui],
};