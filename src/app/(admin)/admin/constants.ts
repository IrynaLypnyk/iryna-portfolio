import { routes } from '@/constants/routes';
import { FlaskConical, FolderKanban, Home, Images } from 'lucide-react';

export const ADMIN_NAV_LINKS = [
  {
    href: routes.admin.root,
    label: 'Dashboard',
    icon: Home,
    description: 'Overview and quick access to sections',
  },
  {
    href: routes.admin.projects,
    label: 'Projects',
    icon: FolderKanban,
    description: 'Manage portfolio projects, their content and images',
  },
  {
    href: routes.admin.experiments,
    label: 'Experiments',
    icon: FlaskConical,
    description: 'Manage interactive demos and experimental work',
  },
  {
    href: routes.admin.media,
    label: 'Media',
    icon: Images,
    description: 'View and manage uploaded images and media files',
  },
] as const;
