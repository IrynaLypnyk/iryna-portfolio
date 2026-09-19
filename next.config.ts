import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Оптимізація зображень
  // images: {
  //   formats: ['image/webp', 'image/avif'],
  //   minimumCacheTTL: 60,
  //   deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  //   imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  // },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      // Used by seed/placeholder blog post cover images (src/content/blog).
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Експериментальні функції для продуктивності
  experimental: {
    scrollRestoration: true,
    instantInsights: {
      validationLevel: 'warning',
    },
  },

  // Стиснення
  compress: true,

  // Webpack конфігурація для SVG як компонентів
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },

  // Заголовки для кешування
  async headers() {
    return [
      {
        source: '/logo.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      ...(isDev
        ? {
            '**/*.{tsx,jsx}': {
              loaders: [
                {
                  loader: '@locator/webpack-loader',
                  options: { env: 'development' },
                },
              ],
            },
          }
        : {}),
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
