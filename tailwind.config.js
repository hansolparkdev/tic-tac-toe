/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        danger: '#DC2626',
        success: '#16A34A',
        markX: '#3B82F6',
        markO: '#F97316',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0.6)' },
          '50%': { boxShadow: '0 0 0 8px rgba(37,99,235,0)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        pop: 'pop 0.15s ease-out',
        shake: 'shake 0.2s ease-in-out',
        'pulse-ring': 'pulseRing 1s ease-in-out infinite',
        'draw-line': 'drawLine 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
