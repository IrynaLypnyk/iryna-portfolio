import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { ProjectCaseStudy } from './ProjectCaseStudy';
import { ExperimentCaseStudy } from './ExperimentCaseStudy';
import { PageContainer } from '@/app/(site)/[locale]/_components/_ui/PageContainer';
import { SiteHeader } from '@/app/(site)/[locale]/_components/_layouts/SiteHeader';
import { SiteFooter } from '@/app/(site)/[locale]/_components/_layouts/SiteFooter';
import { ExperimentCard } from '@/app/(site)/[locale]/_components/_layouts/ExperimentCard';
import { RecentProjectArticle } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/RecentProjectArticle';
import type { ProjectDetail, Photo } from '@/types/projects';
import { useLocale } from 'next-intl';
const image: Photo<string> = {
  id: 'image',
  src: '/storybook/case-study-screen.svg',
  mimeType: 'image/svg+xml',
  width: 1200,
  height: 800,
  alt: 'Screenshot with readable text at both edges',
  description: 'Screenshot caption',
  linkUrl: null,
};
const video: Photo<string> = {
  ...image,
  id: 'video',
  src: '/storybook/media-editor.webm',
  mimeType: 'video/webm',
  width: 160,
  height: 90,
  alt: 'Video demonstration',
};
function Fixture({
  kind = 'project',
  small = false,
  overview = false,
}: {
  kind?: 'project' | 'experiment';
  small?: boolean;
  overview?: boolean;
}) {
  const uk = useLocale() === 'uk';
  const project: ProjectDetail = {
    slug: 'design-fixture',
    title: uk
      ? 'Портфоліо художника та відеографа — редакційна презентація проєкту'
      : 'Artist and videographer portfolio — an editorial case study with a long title',
    shortLabel: 'Design fixture',
    subtitle: uk
      ? 'Збережена редакційна композиція'
      : 'Preserving the existing editorial composition',
    context: 'Overview text',
    lead: uk
      ? 'Двоколонковий вступ із метаданими та компактним зображенням.'
      : 'The introduction keeps the existing two-column composition, metadata panel and restrained blue accents.',
    role: uk ? 'Розробка інтерфейсу' : 'Frontend development',
    stack: ['Next.js', 'TypeScript'],
    projectType: 'Portfolio',
    status: 'COMPLETED',
    yearLabel: '2026',
    featured: true,
    order: 1,
    hasDetailPage: !overview,
    coverPhoto: small ? { ...image, width: 200, height: 133 } : image,
    featuresTitle: null,
    features: ['Responsive layouts', 'Bilingual content'],
    externalUrl: 'https://example.com',
    linkLabel: null,
    githubUrl: null,
    storybookUrl: null,
    index: '01',
    linkNote: null,
    photos: [{ ...image, id: 'additional' }],
    sections: [
      {
        id: 'one',
        index: '01',
        title: uk ? 'Контекст і завдання' : 'Context and objectives',
        body: uk
          ? 'Перший абзац.\n\nДругий абзац.'
          : 'First paragraph describing the project context.\n\nSecond paragraph explains the design constraints and implementation.',
        photos: [image, video],
      },
      {
        id: 'two',
        index: '02',
        title: null,
        body: uk
          ? 'Текстовий блок без заголовка.'
          : 'An optional text-only block without a heading.',
        photos: [],
      },
      { id: 'three', index: '03', title: null, body: null, photos: [image] },
    ],
    next: { slug: 'next-fixture', title: uk ? 'Наступний проєкт' : 'Next project' },
  };
  const experiment = {
    slug: 'experiment-fixture',
    index: '01',
    hasDetailPage: !overview,
    title: project.title,
    description: project.lead ?? '',
    shortDescription: project.subtitle ?? '',
    stack: 'Next.js · TypeScript',
    demoUrl: 'https://example.com',
    githubUrl: null,
    cover: project.coverPhoto,
    photos: project.photos,
    blocks: project.sections,
  };
  return (
    <div className="bg-app-page text-app-text">
      <SiteHeader />
      <PageContainer>
        {overview ? (
          <>
            <RecentProjectArticle project={project} index={1} />
            <ExperimentCard experiment={experiment} />
          </>
        ) : kind === 'project' ? (
          <ProjectCaseStudy detail={project} />
        ) : (
          <ExperimentCaseStudy
            detail={{ experiment, next: { slug: 'next-fixture', title: 'Next experiment' } }}
          />
        )}
      </PageContainer>
      <SiteFooter />
    </div>
  );
}
const meta = {
  title: 'Public/CaseStudyV2',
  component: Fixture,
  parameters: { layout: 'fullscreen' },
  args: { kind: 'project', small: false, overview: false },
} satisfies Meta<typeof Fixture>;
export default meta;
type Story = StoryObj<typeof meta>;
const exercise: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const heading = canvas.getByRole('heading', { level: 1 });
  await expect(parseFloat(getComputedStyle(heading).fontSize)).toBeLessThanOrEqual(56);
  const cover = canvasElement.querySelector('[data-component="CaseCover"]') as HTMLElement;
  await expect(cover.getBoundingClientRect().width).toBeLessThanOrEqual(360);
  await expect(cover.parentElement).toBe(heading.parentElement);
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  await expect(canvasElement.querySelectorAll('[data-component="CaseSection"]')).toHaveLength(3);
  await userEvent.click(
    canvas.getAllByRole('button', { name: /Open (photo|image)|Відкрити фото/i })[0]
  );
  const body = within(canvasElement.ownerDocument.body);
  await waitFor(() => expect(body.getByRole('button', { name: /Close|Закрити/i })).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: /Close|Закрити/i }));
  canvasElement.dataset.caseStudyResult = 'passed';
};
export const Project: Story = { play: exercise };
export const Experiment: Story = { args: { kind: 'experiment' }, play: exercise };
export const SmallCover: Story = { args: { small: true } };
export const Ukrainian: Story = { globals: { locale: 'uk' }, play: exercise };
export const OverviewWithoutDetail: Story = { args: { overview: true } };
