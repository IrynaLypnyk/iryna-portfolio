import { CONTACT_INFO, SOCIAL_LINKS } from '@/constants/contacts';
import { SITE_URL } from './config';

type PersonJsonLdParams = {
  name: string;
  alternateName: string;
  jobTitle: string;
  location: string;
  url: string;
};


export function buildPersonJsonLd({ name, alternateName, jobTitle, location, url }: PersonJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName,
    url,
    jobTitle,
    email: CONTACT_INFO.email,
    image: `${SITE_URL}/images/iryna-lypnyk.webp`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressCountry: 'UK',
    },
    sameAs: Object.values(SOCIAL_LINKS),
  };
}


type WebSiteJsonLdParams = {
  name: string;
  url: string;
};

/** Sitewide `WebSite` structured data. */
export function buildWebSiteJsonLd({ name, url }: WebSiteJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
  };
}

type BreadcrumbItem = {
  name: string;
  url: string;
};

/** `BreadcrumbList` structured data for a page, e.g. Home > Projects > [Project title]. */
export function buildBreadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
