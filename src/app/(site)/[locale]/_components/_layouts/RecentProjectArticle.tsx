'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useProjectMeta, selectProjectMeta, type ProjectMetaKey } from '@/hooks/useProjectMeta';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';

type Props = {
  project: ProjectData;
  /** 1-based position; the first cover is loaded with priority. */
  index: number;
};

export function RecentProjectArticle({ project, index }: Props) {
  const t = useTranslations('Work');
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const allMeta = useProjectMeta(project);

  // Add, remove or reorder fields here; move a key between lists to change its group.
  const metaFields: ProjectMetaKey[] = ['type', 'role', 'status', 'year'];
  const expandedFields: ProjectMetaKey[] = ['stack', 'features', 'gallery'];

  const meta = selectProjectMeta(allMeta, metaFields);
  const expandedMeta = selectProjectMeta(
    allMeta,
    expandedFields.filter((key) => !metaFields.includes(key))
  );
  const expandable = expandedMeta.length > 0;

  // Keep the gallery full-width in either group; adjacent metadata stays in a list.
  function renderMeta(items: MetaItem[], expanded = false) {
    const groups: MetaItem[][] = [];
    for (const item of items) {
      const previousGroup = groups.at(-1);
      if (!previousGroup || item === allMeta.gallery || previousGroup[0] === allMeta.gallery) {
        groups.push([item]);
      } else {
        previousGroup.push(item);
      }
    }
    return groups.map((group) =>
      group[0] === allMeta.gallery ? (
        <div key="gallery" className="grid gap-3">
          <Label color={expanded ? 'blue' : 'gray'}>{group[0].label}</Label>
          {group[0].value}
        </div>
      ) : (
        <MetaList
          key={group[0].label}
          items={group}
          variant="compact"
          labelColor={expanded ? 'blue' : 'gray'}
          labelWidth={110}
          className={expanded ? 'gap-6' : ''}
        />
      )
    );
  }

  const links = [
    project.externalUrl && {
      href: project.externalUrl,
      label: project.linkLabel ?? t('demoLabel'),
    },
    project.githubUrl && { href: project.githubUrl, label: t('githubLabel') },
    project.storybookUrl && { href: project.storybookUrl, label: t('storybookLabel') },
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  const showMoreButton = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={`${open ? t('hideDetails') : t('showDetails')}: ${project.title}`}
      onClick={() => setOpen((current) => !current)}
      className="cursor-pointer"
    >
      <ActionBox>
        {open ? <Minus size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
      </ActionBox>
    </button>
  );

  return (
    <article
      data-component="RecentProjectArticle"
      className={cn(
        'border-app-line grid gap-7 overflow-visible border-b pr-(--page-pad-right) pb-[clamp(28px,5vh,56px)] first:border-t last:border-b last:pb-[clamp(32px,6vh,64px)]'
      )}
    >
      <div
        className={cn(
          'group relative grid items-start gap-[clamp(20px,3.5vw,48px)] pt-[clamp(28px,5vh,56px)]',
          expandable
            ? 'md:grid-cols-[auto_minmax(0,1fr)_minmax(160px,220px)]'
            : 'md:grid-cols-[minmax(0,1fr)_minmax(160px,220px)]'
        )}
      >
        {/* only Desktop */}
        {expandable && <div className="hidden md:inline-block">{showMoreButton}</div>}

        <div className="grid gap-4">
          <h3
            className={cn(
              'text-[clamp(22px,2.6vw,34px)] leading-tight font-medium tracking-normal text-pretty transition-colors',
              expandable && 'group-hover:text-app-ink'
            )}
          >
            {project.title}
          </h3>

          <p className="text-app-muted text-[17px] leading-[1.6] text-pretty">{project.context}</p>

          {renderMeta(meta)}

          {links.length > 0 && (
            <div className="relative inline-flex flex-wrap gap-x-4 gap-y-1.5">
              {links.map((link) => (
                <AppLink
                  key={link.label}
                  href={link.href}
                  external
                  arrow="upRight"
                  color="black"
                  variant="underline"
                >
                  {link.label}
                </AppLink>
              ))}
            </div>
          )}
        </div>

        <ImageFrame
          photo={project.coverPhoto}
          placeholder={t('coverPlaceholder', { title: project.shortLabel })}
          priority={index === 1}
          sizes="(min-width: 768px) 20vw, 40vw"
          className="aspect-4/3"
        />

        {/* here only Mobile */}
        {expandable && <div className="inline-block md:hidden">{showMoreButton}</div>}
      </div>

      <AnimatePresence initial={false}>
        {expandable && open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-app-line -pr-(--page-pad-right) overflow-visible border-t pt-7"
          >
            <div className="grid gap-6 pb-4">{renderMeta(expandedMeta, true)}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
