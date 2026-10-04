import { Manrope, IBM_Plex_Mono } from 'next/font/google';

export const sans = Manrope({
  subsets: ['latin', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const mono = IBM_Plex_Mono({
  subsets: ['latin', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});
