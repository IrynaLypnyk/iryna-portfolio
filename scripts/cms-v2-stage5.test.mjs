import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTypeScript as load } from './helpers/load-typescript.mjs';
const image = (id, w = 1200, h = 800) => ({
  id,
  src: `/${id}.png`,
  mimeType: 'image/png',
  width: w,
  height: h,
});
const usage = (id, asset = image(id)) => ({
  id,
  asset,
  assetUk: null,
  captionEn: 'Caption',
  captionUk: 'Підпис',
  descriptionEn: 'Description',
  descriptionUk: 'Опис',
  linkUrl: 'https://example.com',
  isProjectCover: false,
});
const row = {
  id: 'owner',
  slug: 'case',
  titleEn: 'Case',
  titleUk: 'Кейс',
  descriptionEn: 'Text',
  descriptionUk: 'Текст',
  shortDescriptionEn: '',
  shortDescriptionUk: '',
  published: true,
  detailPageStatus: 'PUBLISHED',
  featured: true,
  order: 1,
  status: 'COMPLETED',
  stack: [],
  photos: [],
  featuresEn: ['Feature'],
  featuresUk: ['Функція'],
  coverAsset: image('cover'),
  coverAssetUk: image('cover-uk'),
  contentBlocks: [],
};
const mediaMocks = { '@/lib/imagekit/get-image-url': { getImageUrl: (src) => src } };
const { toProjectData, toProjectDetail } = load('src/lib/data/project-mappers.ts', mediaMocks);

test('independent EN/UK covers do not promote gallery items; legacy cover-only usages stay hidden', () => {
  const p = {
    ...row,
    photos: [{ ...usage('legacy'), isProjectCover: true }, usage('shared', row.coverAsset)],
  };
  assert.equal(toProjectData(p, 'uk').coverPhoto.src, '/cover-uk.png');
  assert.equal(toProjectData({ ...p, coverAssetUk: null }, 'uk').coverPhoto.src, '/cover.png');
  assert.equal(toProjectData({ ...p, coverAsset: null }, 'en').coverPhoto, null);
  assert.deepEqual(
    Array.from(toProjectData(p, 'en').photos, (x) => x.id),
    ['shared']
  );
});
test('ordered localized blocks retain IDs, media-only blocks, paragraphs and localised media; empty blocks disappear', () => {
  const p = {
    ...row,
    contentBlocks: [
      { id: 'empty', photos: [] },
      {
        id: 'text',
        titleEn: 'Heading',
        titleUk: 'Назва',
        bodyEn: 'One\n\nTwo',
        bodyUk: 'Один',
        photos: [],
      },
      { id: 'media', photos: [{ ...usage('usage'), assetUk: image('uk') }] },
    ],
  };
  const en = toProjectDetail(p, [p], 'en');
  const uk = toProjectDetail(p, [p], 'uk');
  assert.deepEqual(
    Array.from(en.sections, (x) => x.id),
    ['text', 'media']
  );
  assert.equal(en.sections[0].body, 'One\n\nTwo');
  assert.equal(uk.sections[0].title, 'Назва');
  assert.equal(uk.sections[1].photos[0].src, '/uk.png');
  assert.equal(uk.sections[1].photos[0].alt, 'Підпис');
  assert.equal(en.sections[1].index, '02');
  assert.ok(!('sections' in toProjectData(p, 'en')));
});
test('next navigation excludes draft, disabled and unpublished pages; Features remain in overview data', () => {
  const siblings = [
    row,
    { ...row, slug: 'draft', detailPageStatus: 'DRAFT' },
    { ...row, slug: 'none', detailPageStatus: 'NONE' },
    { ...row, slug: 'hidden', published: false },
    { ...row, slug: 'next' },
  ];
  assert.equal(toProjectDetail(row, siblings, 'en').next.slug, 'next');
  assert.equal(toProjectDetail(row, [row], 'en').next, null);
  const draft = toProjectData({ ...row, detailPageStatus: 'DRAFT' }, 'en');
  assert.equal(draft.hasDetailPage, false);
  assert.equal(draft.features[0], 'Feature');
});
for (const entity of ['project', 'experiment'])
  test(`${entity} detail and sitemap queries enforce both publication flags and stable media ordering`, async () => {
    const queries = [];
    const model = {
      findFirst: async (q) => {
        queries.push(q);
        return null;
      },
      findMany: async (q) => {
        queries.push(q);
        return [];
      },
    };
    const mocks = {
      ...mediaMocks,
      'next/cache': { unstable_cache: (fn) => fn },
      '@/lib/prisma': { prisma: { [entity]: model } },
    };
    const dataModule = load(`src/lib/data/${entity}s.ts`, mocks);
    if (entity === 'project') {
      await dataModule.getPublishedProjectDetail('draft');
      await dataModule.getAllProjectSlugsForSitemap();
    } else {
      await dataModule.getExperimentDetail('draft', 'uk');
      await dataModule.getAllExperimentSlugsForSitemap();
    }
    for (const q of queries) {
      assert.equal(q.where.published, true);
      assert.equal(q.where.detailPageStatus, 'PUBLISHED');
    }
    const included = queries[0].include;
    assert.equal(included.photos.where.isProjectCover, false);
    assert.equal(included.photos.where.contentBlockId, null);
    assert.equal(included.contentBlocks.orderBy[0].order, 'asc');
    assert.equal(included.contentBlocks.include.photos.orderBy[0].orderInProject, 'asc');
  });

test('compact covers fit natural dimensions and never crop or stretch small images', () => {
  const { ImageFrame } = load('src/app/(site)/[locale]/_components/_ui/ImageFrame.tsx', {
    'next/image': { default: ({ priority: _p, ...props }) => React.createElement('img', props) },
  });
  for (const [width, height] of [
    [1200, 800],
    [200, 100],
    [800, 1600],
  ]) {
    const html = renderToStaticMarkup(
      React.createElement(ImageFrame, {
        compact: true,
        photo: { ...image('cover', width, height), src: '/cover.png', alt: 'Cover' },
      })
    );
    assert.ok(html.includes(`width:min(${width}px, clamp(280px, 28vw, 360px))`));
    assert.ok(html.includes('object-contain'));
    assert.ok(!html.includes('object-cover'));
  }
  assert.equal(
    renderToStaticMarkup(React.createElement(ImageFrame, { compact: true, photo: null })),
    ''
  );
});

test('numbered sections keep the editorial columns with paragraphs and media beneath', () => {
  const { CaseSection } = load(
    'src/app/(site)/[locale]/projects/[slug]/_components/CaseSection.tsx',
    {
      '@/app/(site)/[locale]/_components/_ui/ImagesGallery': {
        ImagesGallery: ({ photos }) =>
          React.createElement('div', { 'data-gallery': photos.length }),
      },
    }
  );
  const html = renderToStaticMarkup(
    React.createElement(CaseSection, {
      section: {
        id: 'b',
        index: '01',
        title: 'Heading',
        body: 'One\n\nTwo',
        photos: [usage('photo')],
      },
    })
  );
  assert.ok(html.includes('border-t'));
  assert.ok(html.includes('md:grid-cols-'));
  assert.equal((html.match(/<p /g) || []).length, 2);
  assert.ok(html.indexOf('data-gallery') > html.indexOf('Two'));
});
