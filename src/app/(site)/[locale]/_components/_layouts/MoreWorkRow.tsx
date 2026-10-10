import { ProjectStack } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack';
import { Link } from '@/i18n/navigation';
import { routes } from '@/constants/routes';
import type { ProjectData } from '@/types/projects';

type Props = {
  project: ProjectData;
};

export function MoreWorkRow({ project }: Props) {
  const hasStack = project.stack.length > 0;

  return (
    <div
      data-component="MoreWorkRow"
      className="border-app-line grid items-baseline gap-4.5 border-b py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
    >
      <Link
        href={routes.project(project.slug)}
        className="text-app-ink hover:text-app-accent text-[17px] transition-colors"
      >
        {project.title}
      </Link>

      <span className="text-app-muted text-[15px] text-pretty">{project.context}</span>

      {(hasStack || project.yearLabel) && (
        <span className="text-app-accent-light font-mono text-xs">
          <ProjectStack items={project.stack} />
          {hasStack && project.yearLabel && ' · '}
          {project.yearLabel}
        </span>
      )}
    </div>
  );
}
