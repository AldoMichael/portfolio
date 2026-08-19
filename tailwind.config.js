/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class', // thème sombre activé en permanence via <html class="dark">
  theme: {
    extend: {
      colors: {
        // Palette « nuit profonde » (conservée pour le bouton primaire)
        night: {
          950: '#05070d',
          900: '#080b14',
          800: '#0c1120',
          700: '#131a2c',
          600: '#1b2438',
        },
        // Fond et texte sémantiques : basculent avec le thème clair / sombre
        page: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          2: 'rgb(var(--bg-2) / <alpha-value>)',
          3: 'rgb(var(--bg-3) / <alpha-value>)',
        },
        ink: 'rgb(var(--fg) / <alpha-value>)',
        // La couleur d'accent est pilotée par une variable CSS (--accent)
        // pour pouvoir être changée à chaud depuis l'interface.
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 8vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--accent) / 0.35), 0 8px 40px -8px rgb(var(--accent) / 0.45)',
        'glow-sm': '0 0 24px -6px rgb(var(--accent) / 0.5)',
        card: '0 1px 0 0 rgb(255 255 255 / 0.05) inset, 0 24px 60px -30px rgb(0 0 0 / 0.9)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, transparent, rgb(var(--bg) / 1) 90%), linear-gradient(rgb(var(--fg) / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--fg) / 0.04) 1px, transparent 1px)',
        'accent-gradient':
          'linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-soft)) 100%)',
      },
      backgroundSize: {
        grid: '100% 100%, 56px 56px, 56px 56px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(6%, -8%) scale(1.1)' },
          '66%': { transform: 'translate(-6%, 6%) scale(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        blob: 'blob 18s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
}
