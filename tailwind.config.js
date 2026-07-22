/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 和紙 / washi paper tones
        paper: '#ece9df',
        washi: '#faf8f2',
        line: '#ddd8c9',
        // 墨 / ink text
        ink: {
          DEFAULT: '#242019',
          soft: '#5c554a',
          faint: '#8a8272',
        },
        // 藍 / indigo — primary
        ai: {
          DEFAULT: '#2a4a63',
          deep: '#1f3a4d',
          light: '#e7edf1',
        },
        // 朱 / vermillion — reserved for pins & edit state
        shu: {
          DEFAULT: '#c05640',
          deep: '#a5442f',
          light: '#f3e2dc',
        },
        // 真鍮 / brass — quiet highlight
        brass: '#9a7b3f',
      },
      fontFamily: {
        serif: [
          '"Noto Serif JP"',
          '"Hiragino Mincho ProN"',
          '"Yu Mincho"',
          'YuMincho',
          'serif',
        ],
        sans: [
          '"Noto Sans JP"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          'YuGothic',
          'Meiryo',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(36,32,25,0.04), 0 8px 24px -12px rgba(36,32,25,0.18)',
        lift: '0 4px 8px rgba(36,32,25,0.06), 0 18px 40px -16px rgba(36,32,25,0.28)',
        pin: '0 3px 8px rgba(165,68,47,0.45)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pin-drop': {
          '0%': { opacity: '0', transform: 'translate(-50%,-140%) scale(0.6)' },
          '60%': { opacity: '1', transform: 'translate(-50%,-90%) scale(1.05)' },
          '100%': { opacity: '1', transform: 'translate(-50%,-100%) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'scale-in': 'scale-in 0.28s cubic-bezier(0.16,1,0.3,1) both',
        'pin-drop': 'pin-drop 0.5s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
