const [minViewport, maxViewport, minFont, maxFont] = process.argv.slice(2).map(Number);

const rootFontSize = 16;

if (
  ![minViewport, maxViewport, minFont, maxFont].every(Number.isFinite) ||
  minViewport <= 0 ||
  minViewport >= maxViewport ||
  minFont <= 0 ||
  minFont > maxFont
) {
  console.error('Usage: npm run fluid-font -- 375 1440 46 96');
  process.exit(1);
}

const slope = (maxFont - minFont) / (maxViewport - minViewport);
const intercept = minFont - slope * minViewport;

const format = (value) => Number(value.toFixed(4));

const minRem = format(minFont / rootFontSize);
const maxRem = format(maxFont / rootFontSize);
const interceptRem = format(Math.abs(intercept) / rootFontSize);
const vw = format(slope * 100);

const preferred = intercept >= 0 ? `${interceptRem}rem+${vw}vw` : `${vw}vw-${interceptRem}rem`;

const clamp = `clamp(${minRem}rem,calc(${preferred}),${maxRem}rem)`;

console.log(`\nCSS:\nfont-size: ${clamp};`);
console.log(`\nTailwind:\ntext-[${clamp}]\n`);

// For example: npm run fluid-font -- 375 1440 46 96