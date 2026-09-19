import { IS_SITE_LIVE, SITE_URL } from '@/lib/seo/config';
import type { MetadataRoute } from 'next';
import { routes } from '@/constants/routes';

export default function robots(): MetadataRoute.Robots {
  // The site is still in development — keep crawlers out entirely until
  // NEXT_PUBLIC_SITE_IS_LIVE is set (mirrors the sitewide `robots` metadata gate).
  if (!IS_SITE_LIVE) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [routes.admin.root, '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
