import type { Config } from 'tailwindcss';

/**
 * Fenix design tokens. Custom palette only — Tailwind's default colors are
 * disabled so the brand system is the single source of truth.
 *
 * Brand: deep navy #0F1C3F, electric teal #00C2CB, warm white #F9FAFB, amber #F59E0B
 * Typography: Sora (headings) + IBM Plex Sans (body/data)
 *
 * Surface/content tokens map to CSS variables so light/dark themes swap via the
 * `class` strategy (see styles/index.css).
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',

      // Brand scales
      navy: {
        50: '#E7EAF1',
        100: '#C3CAD9',
        200: '#9BA7C0',
        300: '#6F80A1',
        400: '#46588029',
        500: '#2A3B66',
        600: '#1C2C52',
        700: '#142346',
        800: '#0F1C3F',
        900: '#0A1430',
        950: '#060D1F',
      },
      teal: {
        50: '#E0FBFC',
        100: '#B3F4F6',
        200: '#80ECEF',
        300: '#4DE3E8',
        400: '#26D5DC',
        500: '#00C2CB',
        600: '#00A0A8',
        700: '#007D83',
        800: '#005A5F',
        900: '#00383B',
      },
      amber: {
        50: '#FEF6E7',
        100: '#FCE7BD',
        200: '#FAD68E',
        300: '#F8C45E',
        400: '#F6B43A',
        500: '#F59E0B',
        600: '#C77F08',
        700: '#985F06',
        800: '#6A4204',
        900: '#3C2502',
      },
      success: {
        50: '#E6F6EC',
        100: '#C2E9CF',
        500: '#16A34A',
        600: '#15803D',
        700: '#166534',
      },
      danger: {
        50: '#FDEAEA',
        100: '#F9CBCB',
        500: '#DC2626',
        600: '#B91C1C',
        700: '#991B1B',
      },
      info: {
        50: '#E8F0FE',
        100: '#C5DAFB',
        500: '#2563EB',
        600: '#1D4ED8',
      },
      white: '#FFFFFF',
      'warm-white': '#F9FAFB',
      black: '#000000',

      // Theme-aware semantic tokens (CSS variables)
      surface: 'rgb(var(--surface) / <alpha-value>)',
      'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
      'surface-3': 'rgb(var(--surface-3) / <alpha-value>)',
      border: 'rgb(var(--border) / <alpha-value>)',
      content: 'rgb(var(--content) / <alpha-value>)',
      'content-muted': 'rgb(var(--content-muted) / <alpha-value>)',
      'content-subtle': 'rgb(var(--content-subtle) / <alpha-value>)',

      // shadcn aliases
      background: 'rgb(var(--background) / <alpha-value>)',
      foreground: 'rgb(var(--foreground) / <alpha-value>)',
      input: 'rgb(var(--input) / <alpha-value>)',
      ring: 'rgb(var(--ring) / <alpha-value>)',
      'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
      destructive: 'rgb(var(--destructive) / <alpha-value>)',
    },
    fontFamily: {
      heading: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
    },
    extend: {
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 28 63 / 0.06), 0 4px 16px -4px rgb(15 28 63 / 0.10)',
        'card-hover': '0 2px 4px 0 rgb(15 28 63 / 0.08), 0 12px 28px -6px rgb(15 28 63 / 0.18)',
        drawer: '-8px 0 32px -8px rgb(15 28 63 / 0.25)',
        focus: '0 0 0 3px rgb(0 194 203 / 0.35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
