import { anchors, routes } from './routes';

export type NavigationLabelKey = 'projects' | 'playground' | 'about' | 'contact';

export const headerNavItems = [
  { id: anchors.projects, href: `${routes.home}#${anchors.projects}`, labelKey: 'projects' },
  { id: anchors.playground, href: `${routes.home}#${anchors.playground}`, labelKey: 'playground' },
  { id: anchors.about, href: `${routes.home}#${anchors.about}`, labelKey: 'about' },
  { id: anchors.contact, href: `${routes.home}#${anchors.contact}`, labelKey: 'contact' },
] as const satisfies readonly {
  id: string;
  href: string;
  labelKey: NavigationLabelKey;
}[];
