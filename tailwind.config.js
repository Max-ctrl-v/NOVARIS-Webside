/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './branchen/*.html',
    './en/**/*.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#04091a',
          900: '#0D1B3E',
          800: '#122244',
          700: '#1A3462',
          600: '#1E4080',
          500: '#1E56B5',
          400: '#3A7FD4',
          300: '#4DAEE5',
          200: '#7ECEF5',
          100: '#C2E8FB',
          50:  '#EBF6FE',
        },
        surface: {
          base:     '#ffffff',
          raised:   '#f5f8fe',
          elevated: '#edf2fb',
          floating: '#ffffff',
          border:   '#dde5f4',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
}
