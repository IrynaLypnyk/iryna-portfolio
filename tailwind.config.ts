import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mulish', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'admin-background': 'var(--admin-background)',
        'admin-foreground': 'var(--admin-foreground)',
        'admin-muted': 'var(--admin-muted)',
        'admin-muted-foreground': 'var(--admin-muted-foreground)',
        'admin-border': 'var(--admin-border)',
        'admin-card': 'var(--admin-card)',
        'admin-card-foreground': 'var(--admin-card-foreground)',
        'admin-accent': 'var(--admin-accent)',
        'admin-primary': 'var(--admin-primary)',
        'admin-primary-foreground': 'var(--admin-primary-foreground)',
        'admin-ay-brand': 'var(--admin-ay-brand)',
        'admin-ay-brand-light': 'var(--admin-ay-brand-light)',
        'admin-ay-bg': 'var(--admin-ay-bg)',
        'admin-ay-accent': 'var(--admin-ay-accent)',
        'admin-ay-text': 'var(--admin-ay-text)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
