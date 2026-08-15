/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // DESIGN_SPEC.md § Color Palette — dark values are the spec's canonical
        // palette. Light-mode counterparts (-light suffix) are not defined in
        // DESIGN_SPEC.md; they're inferred to satisfy INSTRUCTIONS.md's
        // dark+light requirement and mirror the dark palette's relationships.
        background: '#1C1C1E',
        'background-light': '#FAFAFA',
        surface: '#2A2A2E',
        'surface-light': '#FFFFFF',
        border: '#3A3A3E',
        'border-light': '#E0E0E3',
        // Text Primary / Text Secondary
        primary: '#FFFFFF',
        'primary-light': '#1C1C1E',
        secondary: '#A0A0A8',
        'secondary-light': '#6B6B76',
        // Brand accents — constant across themes
        'green-neon': '#39FF14',
        'cyan-vivid': '#00E5FF',
        warning: '#FFB800',
        error: '#FF3B30',
      },
      fontFamily: {
        display: ['MontserratExtraBold', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        'body-medium': ['Inter-Medium', 'sans-serif'],
        'body-semibold': ['Inter-SemiBold', 'sans-serif'],
      },
      fontSize: {
        h1: ['34px', { lineHeight: '40px', fontWeight: '800' }],
        h2: ['24px', { lineHeight: '30px', fontWeight: '700' }],
        h3: ['19px', { lineHeight: '24px', fontWeight: '700' }],
        body: ['15.5px', { lineHeight: '22px' }],
        small: ['12.5px', { lineHeight: '16px' }],
      },
      spacing: {
        card: '16px',
        section: '24px',
      },
    },
  },
  plugins: [],
};
