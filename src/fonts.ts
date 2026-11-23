import localFont from 'next/font/local';

// WOFF2 subsets (Latin + Latin Extended + Cyrillic + punctuation/arrows/symbols) generated from
// the variable TTF sources next to them with:
// pyftsubset <font>.ttf --unicodes="U+0000-024F,U+0259,U+02B0-02FF,U+0300-036F,U+0400-04FF,U+1E00-1EFF,U+2000-2BFF,U+FB00-FB06,U+FEFF,U+FFFD" --layout-features='*' --flavor=woff2
export const sans = localFont({
  src: './assets/fonts/manrope/Manrope-Variable.woff2',
  weight: '400 700',
  style: 'normal',
  variable: '--font-manrope',
  display: 'swap',
});

// Mono is used only for small labels, never for the LCP element — don't let it compete with
// Manrope for bandwidth on the critical path.
export const mono = localFont({
  src: './assets/fonts/geist-mono/GeistMono-Variable.woff2',
  weight: '400 700',
  style: 'normal',
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
});
