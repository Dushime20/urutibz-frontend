/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'my-primary': '#00aaa9',
        'active': '#00aaa9',
        'active-dark': '#006666',
        'platform-grey': '#888888',
        'platform-dark-grey': '#535353',
        'platform-light-grey': '#dedede',
        'platform-error': '#eb0000',
      },
      fontFamily: {
        'outfit': ['Outfit', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'sans': ['Inter', 'Outfit', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'platform': '12px',
      },
      boxShadow: {
        'platform': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
