/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5FF',
          100: '#D1EBFF',
          200: '#A3D7FF',
          300: '#75C3FF',
          400: '#47AFFF',
          500: '#1A9BFF',
          600: '#0077CC',
          700: '#005999',
          800: '#003B66',
          900: '#001D33',
        },
        success: {
          50: '#E6F9F0',
          100: '#CCF3E1',
          200: '#99E7C3',
          300: '#66DBA5',
          400: '#33CF87',
          500: '#00C369',
          600: '#009C54',
          700: '#00753F',
          800: '#004E2A',
          900: '#002715',
        },
        error: {
          50: '#FFE8E8',
          100: '#FFD1D1',
          200: '#FFA3A3',
          300: '#FF7575',
          400: '#FF4747',
          500: '#FF1919',
          600: '#CC1414',
          700: '#990F0F',
          800: '#660A0A',
          900: '#330505',
        },
        dark: {
          50: '#F5F5F7',
          100: '#E8E8ED',
          200: '#D1D1DB',
          300: '#BABAC9',
          400: '#A3A3B7',
          500: '#8C8CA5',
          600: '#707084',
          700: '#545463',
          800: '#383842',
          900: '#1C1C21',
        },
      },
      fontFamily: {
        'sans': ['System'],
        'display': ['System'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
