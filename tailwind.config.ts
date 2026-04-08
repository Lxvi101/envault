import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#ffffff',
          surface: '#f7f7f8',
          raised: '#ededf0',
          border: '#d5d5d8',
          muted: '#86868b',
          text: '#1d1d1f',
          accent: '#0066cc',
          'accent-hover': '#0055b3',
          success: '#34c759',
          danger: '#ff3b30',
          warning: '#ff9f0a',
          sidebar: '#f2f2f7',
          'field-label': '#0066cc',
          'selected': '#e8f0fe',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
