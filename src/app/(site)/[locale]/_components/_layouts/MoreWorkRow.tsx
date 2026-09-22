import { Link } from '@/i18n/navigation';
import { routes } from '@/constants/routes';
import type { ProjectData } from '@/types/projects';

type Props = {
  project: ProjectData;
};

/**
 * A compact "More work" entry: title, one-line description, and the stack/year
 * stamp on the right. This is what a project looks like once `featured` is off.
 */
export function MoreWorkRow({ project }: Props) {
  const stamp = [project.stack, project.yearLabel].filter(Boolean).join(' · ');

  return (
    <div
      data-component="MoreWorkRow"
      className="border-line grid items-baseline gap-4.5 border-b py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
    >
      <Link
        href={routes.project(project.slug)}
        className="text-ink hover:text-accent text-[17px] transition-colors"
      >
        {project.title}
      </Link>

      <span className="text-muted text-[15px] text-pretty">{project.context}</span>

      {stamp && <span className="text-accent-soft font-mono text-xs">{stamp}</span>}
    </div>
  );
}
