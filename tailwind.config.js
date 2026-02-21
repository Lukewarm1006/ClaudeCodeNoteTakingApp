/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        surface: {
          0: '#0f0f0f',
          1: '#161616',
          2: '#1c1c1c',
          3: '#242424',
          4: '#2c2c2c',
        },
        border: {
          DEFAULT: '#2a2a2a',
          soft: '#222222',
        },
        accent: {
          green: '#4caf87',
          'green-dim': '#2d6b54',
          blue: '#5b9bd5',
          purple: '#9b8dc7',
        },
        text: {
          primary: '#e8e8e8',
          secondary: '#888888',
          muted: '#555555',
        },
      },
    },
  },
  plugins: [],
}
