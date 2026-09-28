import { anchors, routes } from './routes';

export type NavigationLabelKey = 'projects' | 'playground' | 'about' | 'contact';

export const homeLinks = {
  projects: `${routes.home}#${anchors.projects}`,
  playground: `${routes.home}#${anchors.playground}`,
  about: `${routes.home}#${anchors.about}`,
  contact: `${routes.home}#${anchors.contact}`,
} as const;

export const headerNavItems = [
  { id: anchors.projects, href: homeLinks.projects, labelKey: 'projects' },
  { id: anchors.playground, href: homeLinks.playground, labelKey: 'playground' },
  { id: anchors.about, href: homeLinks.about, labelKey: 'about' },
  { id: anchors.contact, href: homeLinks.contact, labelKey: 'contact' },
] as const satisfies readonly {
  id: string;
  href: string;
  labelKey: NavigationLabelKey;
}[];
