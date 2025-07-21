/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Platform design system colors
        'active': 'rgb(0, 170, 169)',
        'active-dark': 'rgb(0, 50, 50)',
        'platform-grey': 'rgb(136, 136, 136)',
        'platform-dark-grey': 'rgb(83, 83, 83)',
        'platform-light-grey': 'rgb(222, 222, 222)',
        'platform-error': 'rgb(235, 0, 0)',
        
        // Enhanced primary palette based on active color
        primary: {
          50: '#f0fdfd',
          100: '#ccfcfc',
          200: '#99f8f8',
          300: '#5cf0f0',
          400: '#22d9d9',
          500: '#00aaa9', // Active color
          600: '#008584',
          700: '#006666',
          800: '#004d4d',
          900: '#003232', // Active dark
        },
        
        // Grey scale matching platform colors
        grey: {
          50: '#f9f9f9',
          100: '#f0f0f0',
          200: '#dedede', // Platform light grey
          300: '#cccccc',
          400: '#b3b3b3',
          500: '#888888', // Platform grey
          600: '#666666',
          700: '#535353', // Platform dark grey
          800: '#404040',
          900: '#2d2d2d',
        },
        
        // Error states
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#eb0000', // Platform error
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Success states (complementary to active)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        // Warning states
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'my-primary': '#00aaa9',
      },
      fontFamily: {
        'outfit': ['Outfit', 'Inter', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'sans': ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'platform': '12px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'platform': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'platform-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'platform-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
