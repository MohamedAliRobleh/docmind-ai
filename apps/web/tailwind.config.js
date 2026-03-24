/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        bg:        '#0a0a0f',
        surface:   '#111118',
        raised:    '#1a1a26',
        border:    '#2a2a3a',
        accent:    '#e8ff47',
        purple:    '#7c5cbf',
        secondary: '#a0a0b8',
        muted:     '#5a5a72',
      },
      backgroundImage: {
        'hero-glow':   'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(124,92,191,0.3) 0%, transparent 70%)',
        'accent-glow': 'radial-gradient(ellipse 50% 30% at 50% 100%, rgba(232,255,71,0.08) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
