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
          bg: '#0a0a0f',
          surface: '#12121a',
          raised: '#1a1a26',
          border: '#252535',
          muted: '#6b6b8a',
          text: '#e2e2f0',
          accent: '#6366f1',
          'accent-hover': '#818cf8',
          success: '#22c55e',
          danger: '#ef4444',
          warning: '#f59e0b',
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
