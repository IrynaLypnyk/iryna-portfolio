import { routes } from '@/constants/routes';
import { FlaskConical, FolderKanban, Home, Images } from 'lucide-react';

export const ADMIN_NAV_LINKS = [
  {
    href: routes.admin.root,
    label: 'Головна',
    icon: Home,
    description: 'Огляд і швидкий доступ до розділів',
  },
  {
    href: routes.admin.projects,
    label: 'Проєкти',
    icon: FolderKanban,
    description: 'Керування проєктами портфоліо, їхнім контентом і зображеннями',
  },
  {
    href: routes.admin.experiments,
    label: 'Експерименти',
    icon: FlaskConical,
    description: 'Керування інтерактивними демо та експериментальними роботами',
  },
  {
    href: routes.admin.media,
    label: 'Медіа',
    icon: Images,
    description: 'Перегляд і керування завантаженими зображеннями та медіафайлами',
  },
] as const;
