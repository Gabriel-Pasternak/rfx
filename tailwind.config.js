module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366', // KEZAD deep blue
          dark: '#001a33',   // darker blue for hover
        },
        accent: {
          DEFAULT: '#FF6600', // KEZAD orange
        },
        secondary: {
          DEFAULT: '#f5f6fa', // light gray background
        },
        danger: {
          DEFAULT: '#dc2626', // red-600
        },
        success: {
          DEFAULT: '#16a34a', // green-600
        },
        warning: {
          DEFAULT: '#facc15', // yellow-400
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Open Sans', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.btn-primary': {
          '@apply bg-primary text-white font-bold rounded-lg px-6 py-2 shadow hover:bg-accent focus:ring-2 focus:ring-accent transition': {},
        },
        '.btn-secondary': {
          '@apply bg-white text-primary border border-primary font-bold rounded-lg px-6 py-2 shadow hover:bg-accent hover:text-white focus:ring-2 focus:ring-accent transition': {},
        },
        '.card': {
          '@apply bg-white rounded-2xl shadow-card p-6 mb-4': {},
        },
      });
    },
  ],
}; 