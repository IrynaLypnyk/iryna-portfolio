import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const project = {
  id: 'project',
  slug: 'minimal',
  titleEn: 'Title',
  titleUk: 'Назва',
  shortLabel: null,
  subtitleEn: null,
  subtitleUk: ' ',
  contextEn: '',
  contextUk: null,
  leadEn: null,
  leadUk: '  ',
  roleEn: null,
  roleUk: null,
  status: 'COMPLETED',
  order: 0,
  published: true,
  featured: false,
  projectTypeEn: null,
  projectTypeUk: null,
  yearLabel: null,
  stack: [],
  featuresEn: [],
  featuresUk: [],
  photos: [],
  sections: [],
  externalUrl: null,
  githubUrl: null,
  storybookUrl: null,
};

test('public mappers retain nulls and normalise empty legacy descriptive text in both locales', () => {
  const { toProjectData, toProjectDetail } = loadTypeScript('src/lib/data/project-mappers.ts', {
    '@/lib/imagekit/get-image-url': { getImageUrl: (src) => src },
  });
  for (const locale of ['en', 'uk']) {
    const data = toProjectData(project, locale);
    const detail = toProjectDetail(project, [project], locale);
    for (const key of ['shortLabel', 'subtitle', 'context', 'role']) assert.equal(data[key], null);
    assert.equal(detail.lead, null);
    assert.equal(data.title, locale === 'en' ? 'Title' : 'Назва');
  }
});

function detailPage(data = project) {
  const translation = (key) => key;
  translation.has = () => false;
  const mocks = {
    react: { ...React, cache: (fn) => fn },
    'next-intl': { useTranslations: () => translation },
    'next/navigation': {
      notFound: () => {
        throw new Error('404');
      },
    },
    'next-intl/server': { setRequestLocale: () => {}, getTranslations: async () => translation },
    '@/i18n/navigation': { Link: ({ children }) => React.createElement('a', null, children) },
    '@/lib/data/projects': {
      getPublishedProjectDetail: async () => data,
      getDetailProjectNeighbours: async () => [data],
      getAllProjectSlugsForSitemap: async () => [],
    },
    '@/lib/imagekit/get-image-url': { getImageUrl: (src) => src },
    '@/lib/seo/config': { buildAlternates: () => ({}) },
  };
  for (const component of ['ImageFrame', 'ImagesGallery', 'MetaList', 'AppLink', 'Label']) {
    mocks[`@/app/(site)/[locale]/_components/_ui/${component}`] = {
      [component]: ({ children, items }) =>
        items
          ? React.createElement('aside', null, items.map((item) => item.label).join(','))
          : (children ?? null),
    };
  }
  return loadTypeScript('src/app/(site)/[locale]/projects/[slug]/page.tsx', mocks);
}

test('Project detail omits empty prose, role rows, short-label separators and missing SEO descriptions', async () => {
  const page = detailPage();
  const params = Promise.resolve({ slug: 'minimal', locale: 'en' });
  const html = renderToStaticMarkup(await page.default({ params }));
  assert.ok(html.includes('Title'));
  assert.ok(!html.includes('labelRole'));
  assert.ok(!html.includes('text-accent-pale'));
  assert.ok(!html.includes('<p'));
  assert.ok(!html.includes('<aside'));
  const metadata = await page.generateMetadata({ params });
  assert.equal(Object.hasOwn(metadata, 'description'), false);
  assert.equal(Object.hasOwn(metadata.openGraph, 'description'), false);
  const filled = detailPage({ ...project, leadEn: ' A lead ' });
  assert.equal((await filled.generateMetadata({ params })).description, 'A lead');
});

test('ProjectForm supports nullable values and requires only slug and bilingual titles', () => {
  const { ProjectForm } = loadTypeScript(
    'src/app/(admin)/admin/(protected)/projects/_components/ProjectForm.tsx',
    {
      'next/navigation': { useRouter: () => ({ push() {}, refresh() {} }) },
      'next-intl': { createTranslator: () => (key) => key },
      '@/app/(admin)/admin/(protected)/_components/UnsavedChangesProvider': {
        useUnsavedChanges() {},
        useConfirmLeave: () => () => true,
      },
      './ProjectField': {
        ProjectField: ({ multiline, error: _error, ...props }) =>
          React.createElement(multiline ? 'textarea' : 'input', props),
        validateProjectControl() {},
      },
      '../../_components/OwnerMediaFields': { OwnerMediaFields: () => null },
      './StackInput': { StackInput: () => null },
      './SectionsEditor': { SectionsEditor: () => null },
      './FeaturesEditor': { FeaturesEditor: () => null },
      '../../_components/AdminSelect': {
        AdminSelect: ({ children, ...props }) => React.createElement('select', props, children),
      },
      '@/app/(admin)/admin/_components/AdminButton': {
        AdminButton: ({ children, type }) => React.createElement('button', { type }, children),
      },
    }
  );
  for (const props of [{ mode: 'create' }, { mode: 'edit', project }]) {
    const html = renderToStaticMarkup(React.createElement(ProjectForm, props));
    const required = (html.match(/<(?:input|textarea|select)\b[^>]*>/g) ?? [])
      .filter((tag) => tag.includes('required=""'))
      .map((tag) => tag.match(/name="([^"]+)"/)?.[1]);
    assert.deepEqual(required.sort(), ['slug', 'titleEn', 'titleUk']);
    assert.ok(!html.includes('value="null"'));
    assert.ok(html.includes('value="COMPLETED" selected=""'));
  }
});

test('legacy public queries exclude block Photos before block rendering is enabled', async () => {
  const queries = [];
  const mocks = {
    '@/lib/prisma': {
      prisma: {
        project: {
          findMany: async (query) => {
            queries.push(query);
            return [];
          },
        },
        experiment: {
          findMany: async (query) => {
            queries.push(query);
            return [];
          },
        },
      },
    },
    'next/cache': { unstable_cache: (fn) => fn },
    '@/lib/imagekit/get-image-url': { getImageUrl: (src) => src },
  };
  await loadTypeScript('src/lib/projects/get-published-projects.ts', mocks).getPublishedProjects(
    'en'
  );
  await loadTypeScript('src/lib/data/projects.ts', mocks).getPublishedProjects();
  await loadTypeScript('src/lib/data/experiments.ts', mocks).getPublishedExperiments('uk');
  assert.equal(queries.length, 3);
  for (const query of queries) assert.equal(query.include.photos.where.contentBlockId, null);
});

for (const type of ['projects', 'experiments']) {
  for (const update of [false, true]) {
    test(`${type} ${update ? 'PATCH' : 'POST'} requires auth before invoking shared save`, async () => {
      let called = false;
      const { POST, PATCH } = loadTypeScript(
        `src/app/api/admin/${type}/${update ? '[id]/' : ''}route.ts`,
        {
          'next/server': {
            NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200 }) },
          },
          'next/cache': { revalidateTag() {} },
          '@/lib/auth': {
            requireAuth: async () => {
              throw new Error('Unauthorized');
            },
          },
          '@/lib/prisma': { prisma: {} },
          '@/lib/content/save': {
            saveProject: async () => {
              called = true;
            },
            saveExperiment: async () => {
              called = true;
            },
          },
          '@/lib/content/http': {
            contentSaveErrorResponse: () => {
              throw new Error('Should not reach save');
            },
          },
          '@/lib/api/prisma-errors': { isRecordNotFoundError: () => false },
          '@/lib/media/delete-media-asset': { deleteMediaAssetIfUnused() {} },
        }
      );
      const response = update
        ? await PATCH({ json: async () => ({}) }, { params: Promise.resolve({ id: 'owner' }) })
        : await POST({ json: async () => ({}) });
      assert.equal(response.status, 401);
      assert.equal(called, false);
    });
  }
}

test('cleanup retains assets even when database and ImageKit are unavailable', async () => {
  const forbidden = () => {
    throw new Error('Must not connect');
  };
  const { cleanupMediaAssets } = loadTypeScript('src/lib/media/delete-media-asset.ts', {
    '@/lib/prisma': { prisma: new Proxy({}, { get: forbidden }) },
    '@/lib/imagekit/client': { getImageKit: forbidden },
  });
  const result = await cleanupMediaAssets(['covered']);
  assert.deepEqual([...result.deferredAssetIds], ['covered']);
  assert.equal(result.deletedAssetIds.length, 0);
  assert.equal(result.failedAssetIds.length, 0);
});
