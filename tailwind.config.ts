import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Every brand-facing color is a `var(--token)` indirection, never a compiled-in
 * hex. That is what keeps the runtime branding bridge alive: `applyBranding()`
 * writes `--primary` / `--accent` / … onto `:root` from the fetched quiz JSON,
 * and utilities like `bg-primary` pick the new value up with zero code branching.
 *
 * Consequence to know about: slash-opacity utilities (`bg-primary/20`) cannot
 * work on these tokens, because a hex in a custom property has no alpha channel
 * to substitute. Use `color-mix(...)` in an arbitrary value instead.
 */
export default {
  content: ['./index.html', './app.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--text-invert)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          deep: 'var(--accent-deep)',
        },
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: {
          DEFAULT: 'var(--card-bg)',
          selected: 'var(--card-selected-bg)',
        },
        text: {
          DEFAULT: 'var(--text)',
          invert: 'var(--text-invert)',
        },
        muted: 'var(--muted)',
        border: 'var(--border)',
        track: 'var(--track)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        brand: 'var(--radius)',
        'brand-sm': 'var(--radius-sm)',
      },
      fontFamily: {
        sans: 'var(--font)',
        display: 'var(--font-display)',
      },
      maxWidth: {
        content: '640px',
        shell: '1300px',
        page: '580px',
      },
      keyframes: {
        screenIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        answerIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        iconPop: {
          from: { opacity: '0', transform: 'scale(0.5)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        screenIn: 'screenIn 0.28s ease both',
        answerIn: 'answerIn 0.42s cubic-bezier(0.22,0.9,0.32,1) backwards',
        fadeSlideUp: 'fadeSlideUp 0.5s cubic-bezier(0.22,0.9,0.32,1) both',
        iconPop: 'iconPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        'accordion-down': 'accordion-down 0.35s cubic-bezier(0.4,0,0.2,1)',
        'accordion-up': 'accordion-up 0.35s cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
