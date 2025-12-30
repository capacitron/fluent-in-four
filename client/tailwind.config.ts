import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary - Warm Terracotta
        primary: {
          50: '#fef7f4',
          100: '#fdeee6',
          200: '#fad9c7',
          300: '#f5be9d',
          400: '#ed9466',
          500: '#e67040',
          600: '#d4532a',
          700: '#b04024',
          800: '#8e3522',
          900: '#752f20',
        },
        // Secondary - Mediterranean Blue
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e5fe',
          300: '#7cd2fd',
          400: '#36bbfa',
          500: '#0c9eeb',
          600: '#007ec9',
          700: '#0165a3',
          800: '#065586',
          900: '#0b476f',
        },
        // Accent - Olive Gold
        accent: {
          50: '#fdfde8',
          100: '#fafbc4',
          200: '#f6f58c',
          300: '#ede84a',
          400: '#dfd31a',
          500: '#c7b80e',
          600: '#9a8f09',
          700: '#6e680b',
          800: '#5a5310',
          900: '#4c4512',
        },
        // Language-specific accents
        spanish: '#c60b1e',
        french: '#002654',
        italian: '#009246',
        portuguese: '#006600',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        xl: '0 20px 25px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
