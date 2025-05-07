/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shine-pulse': 'shine-pulse var(--shine-pulse-duration, 14s) infinite linear',
      },
    },
  },
  plugins: [],
  safelist: ['before:bg-shine-size', 'before:absolute', 'before:inset-0', 'before:aspect-square', 'before:size-full', 'before:rounded-3xl', 'before:will-change-[background-position]', 'before:content-[""]'],
}

