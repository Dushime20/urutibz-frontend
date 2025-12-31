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
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
