import localFont from 'next/font/local';

export const sans = localFont({
  src: './assets/fonts/manrope/Manrope-Variable.ttf',
  weight: '400 700',
  style: 'normal',
  variable: '--font-manrope',
  display: 'swap',
});

export const mono = localFont({
  src: './assets/fonts/geist-mono/GeistMono-Variable.ttf',
  weight: '400 700',
  style: 'normal',
  variable: '--font-geist-mono',
  display: 'swap',
});
