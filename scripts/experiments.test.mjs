import { loadTypeScript as load } from './helpers/load-typescript.mjs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const input = {
  slug: 'experiment',
  titleUk: 'Назва',
  titleEn: 'Title',
  descriptionUk: 'Повний опис',
  descriptionEn: 'Full description',
  shortDescriptionUk: ' Короткий опис ',
  shortDescriptionEn: ' Short summary ',
  order: 0,
};

test('short descriptions are optional, trimmed independently and reject malformed values', () => {
  const { validateExperimentInput } = load('src/app/api/admin/experiments/validation.ts');
  const result = validateExperimentInput(input);
  assert.equal(result.data.shortDescriptionUk, 'Короткий опис');
  assert.equal(result.data.shortDescriptionEn, 'Short summary');
  assert.equal(result.data.descriptionEn, 'Full description');
  for (const key of ['shortDescriptionUk', 'shortDescriptionEn']) {
    for (const value of [undefined, null, '', '  ']) {
      const optional = validateExperimentInput({ ...input, [key]: value });
      assert.equal(optional.error, undefined);
      assert.ok(optional.data[key] === '' || optional.data[key] === undefined);
    }
    for (const value of [42, {}]) {
      assert.ok(validateExperimentInput({ ...input, [key]: value }).error);
    }
  }
});

function setup(options = {}) {
  const calls = { writes: [], deletes: [], tags: [], scopes: [] };
  const metadata = {
    filePath: '/test/experiments/experiment/photos/file',
    width: 800,
    height: 600,
    mime: 'image/png',
    size: 1024,
    fileType: 'image',
    ...options.metadata,
  };
  const imageKit = {
    files: { get: async () => metadata, delete: async (id) => calls.deletes.push(id) },
  };
  const tx = {
    mediaAsset: {
      create: async ({ data }) => {
        if (options.failure) throw new Error('DB failed');
        calls.writes.push(data);
        return { id: 'asset', ...data };
      },
    },
    photo: {
      create: async ({ data }) => {
        calls.writes.push(data);
        return {
          id: 'photo',
          ...data,
          captionUk: null,
          captionEn: null,
          linkUrl: null,
          descriptionUk: null,
          descriptionEn: null,
          asset: { ...calls.writes[0] },
        };
      },
    },
  };
  const prisma = {
    project: { findUnique: async () => (options.missing ? null : { slug: 'experiment' }) },
    experiment: { findUnique: async () => (options.missing ? null : { slug: 'experiment' }) },
    photo: {
      aggregate: async ({ where }) => {
        calls.scopes.push(where);
        return { _max: { orderInProject: 2 } };
      },
    },
    mediaAsset: {
      findUnique: async () => (options.registered ? { id: 'existing' } : null),
      upsert: async ({ create }) => tx.mediaAsset.create({ data: create }),
    },
    $transaction: async (fn) => fn(tx),
  };
  const mocks = {
    './file-lock': { withMediaFileLock: async (_fileId, action) => action() },
    'next/server': {
      NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200 }) },
    },
    '@/lib/api/prisma-errors': { isRecordNotFoundError: () => false },
    'next/cache': { revalidateTag: (tag) => calls.tags.push(tag) },
    '@/lib/auth': {
      requireAuth: async () => {
        if (options.unauthorized) throw new Error('Unauthorized');
      },
    },
    '@/lib/prisma': { prisma },
    '@/lib/imagekit/client': { getImageKit: () => imageKit },
    '@/lib/imagekit/get-image-url': { getImageUrl: (src) => src },
    '@/lib/imagekit/getImageKitFolder': {
      getImageKitFolder: (...parts) => `/test/${parts.join('/')}`,
    },
    '@/lib/imagekit/assertSafeImageKitPath': {
      assertSafeImageKitPath: (src) => assert.ok(src.startsWith('/test/')),
    },
  };
  const { createMediaUploadHandler } = load('src/lib/media/create-media-upload-handler.ts', mocks);
  const finalize = (kind = 'experiments', body = { fileId: 'file' }) =>
    createMediaUploadHandler(kind)(
      { json: async () => body },
      { params: Promise.resolve({ id: 'owner' }) }
    );
  return { calls, mocks, finalize };
}

for (const mime of ['image/png', 'video/mp4', 'video/webm']) {
  test(`experiment upload registers ${mime} as a draft asset without creating a Photo`, async () => {
    const { calls, finalize } = setup({
      metadata: { mime, fileType: mime.startsWith('video/') ? 'non-image' : 'image' },
    });
    const response = await finalize();
    assert.equal(response.status, 201);
    assert.equal(response.body.asset.mimeType, mime);
    assert.equal(calls.writes.length, 1);
    assert.equal(calls.scopes.length, 0);
    assert.equal(response.body.photo, undefined);
    assert.deepEqual(calls.tags, []);
    assert.deepEqual(calls.deletes, []);
  });
}

test('project uploads verify the owner folder and defer all Photo and cache changes', async () => {
  const { calls, finalize } = setup({
    metadata: { filePath: '/test/projects/experiment/photos/file' },
  });
  assert.equal((await finalize('projects')).status, 201);
  assert.equal(calls.writes.length, 1);
  assert.equal(calls.writes[0].src, '/test/projects/experiment/photos/file');
  assert.deepEqual(calls.tags, []);
});

for (const metadata of [
  { filePath: '/test/projects/other/photos/file' },
  { filePath: '/test/experiments/other/photos/file' },
  { mime: 'video/quicktime', fileType: 'non-image' },
  { mime: 'video/mp4', fileType: 'non-image', size: 101 * 1024 * 1024 },
  { size: 26 * 1024 * 1024 },
  { size: 0 },
  { width: 0 },
  { height: -1 },
]) {
  test(`invalid upload rejected before DB writes: ${JSON.stringify(metadata)}`, async () => {
    const { calls, finalize } = setup({ metadata });
    assert.equal((await finalize()).status, 400);
    assert.deepEqual(calls.writes, []);
    assert.deepEqual(calls.deletes, []);
  });
}

test('unauthorized, missing owner and malformed file IDs cannot finalize media', async () => {
  assert.equal((await setup({ unauthorized: true }).finalize()).status, 401);
  assert.equal((await setup({ missing: true }).finalize()).status, 404);
  for (const body of [null, {}, { fileId: 42 }, { fileId: '   ' }]) {
    assert.equal((await setup().finalize('experiments', body)).status, 400);
  }
});

test('failed DB write cleans only the new ImageKit file; registered files are preserved', async (t) => {
  t.mock.method(console, 'error', () => {});
  t.mock.method(console, 'info', () => {});
  t.mock.method(console, 'warn', () => {});
  const fresh = setup({ failure: true });
  assert.equal((await fresh.finalize()).status, 500);
  assert.deepEqual(fresh.calls.deletes, ['file']);
  const registered = setup({ failure: true, registered: true });
  assert.equal((await registered.finalize()).status, 409);
  assert.deepEqual(registered.calls.deletes, []);
});

test('public data uses localized summary, full description and mixed media gallery', async () => {
  const image = { src: 'image', width: 800, height: 600, mimeType: 'image/png' };
  const video = { src: 'video', width: 800, height: 600, mimeType: 'video/mp4' };
  const photo = {
    captionUk: null,
    captionEn: null,
    descriptionUk: 'Підпис',
    descriptionEn: 'Caption',
    linkUrl: null,
    assetUk: null,
  };
  const experiments = [
    {
      ...input,
      coverAsset: image,
      coverAssetUk: null,
      photos: [
        { ...photo, id: 'image', asset: image, isProjectCover: true },
        { ...photo, id: 'video', asset: video, isProjectCover: false },
      ],
    },
  ];
  const { getPublishedExperiments } = load('src/lib/data/experiments.ts', {
    'next/cache': { unstable_cache: (fn) => fn },
    '@/lib/prisma': { prisma: { experiment: { findMany: async () => experiments } } },
    '@/lib/imagekit/get-image-url': { getImageUrl: (src) => src },
  });
  for (const locale of ['en', 'uk']) {
    const [result] = await getPublishedExperiments(locale);
    assert.equal(
      result.shortDescription,
      (locale === 'uk' ? input.shortDescriptionUk : input.shortDescriptionEn).trim()
    );
    assert.equal(result.description, locale === 'uk' ? input.descriptionUk : input.descriptionEn);
    assert.equal(result.cover.src, 'image');
    assert.equal(result.photos[0].mimeType, 'video/mp4');
  }
});

test('cover updates are scoped to the experiment and video covers are rejected', async () => {
  const { mocks } = setup();
  const scopes = [];
  let mime = 'image/png';
  mocks['@/lib/media/delete-media-asset'] = {
    deleteMediaAssetIfUnused: async () => ({ deleted: false }),
  };
  mocks['@/lib/prisma'].prisma.$transaction = async (fn) =>
    fn({
      photo: {
        findUniqueOrThrow: async () => ({
          projectId: null,
          experimentId: 'experiment',
          asset: { mimeType: mime },
        }),
        updateMany: async ({ where }) => scopes.push(where),
        update: async () => ({ project: null, experiment: { slug: 'experiment' } }),
      },
    });
  const { PATCH } = load('src/app/api/admin/photos/[id]/route.ts', mocks);
  const req = {
    json: async () => ({
      orderInProject: 0,
      isProjectCover: true,
      captionUk: null,
      captionEn: null,
      linkUrl: null,
      descriptionUk: null,
      descriptionEn: null,
    }),
  };
  const params = { params: Promise.resolve({ id: 'photo' }) };
  assert.equal((await PATCH(req, params)).status, 200);
  assert.equal(scopes[0].experimentId, 'experiment');
  assert.equal(scopes[0].projectId, undefined);
  mime = 'video/mp4';
  assert.equal((await PATCH(req, params)).status, 400);
  assert.equal(scopes.length, 1);
});

test('reordering cannot mix projects and experiments or duplicate IDs', async () => {
  const { mocks, calls } = setup();
  let photos = [
    { projectId: 'project', experimentId: null },
    { projectId: null, experimentId: 'experiment' },
  ];
  const writes = [];
  mocks['@/lib/prisma'].prisma.$transaction = async (fn) =>
    fn({
      photo: {
        findMany: async () => photos,
        update: async (query) => writes.push(query),
      },
    });
  const { POST } = load('src/app/api/admin/photos/reorder/route.ts', mocks);
  const payload = [
    { id: 'a', orderInProject: 1 },
    { id: 'b', orderInProject: 0 },
  ];
  assert.equal((await POST({ json: async () => payload })).status, 400);
  assert.equal(writes.length, 0);
  assert.equal((await POST({ json: async () => [payload[0], payload[0]] })).status, 400);
  photos = [
    { projectId: null, experimentId: 'experiment' },
    { projectId: null, experimentId: 'experiment' },
  ];
  assert.equal((await POST({ json: async () => payload })).status, 200);
  assert.equal(writes.length, 2);
  assert.deepEqual(calls.tags, ['experiments']);
});

test('experiment card renders the short description instead of the full article text', () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const React = require('react');
  const { ExperimentCard } = load(
    'src/app/(site)/[locale]/_components/_layouts/ExperimentCard.tsx',
    {
      'next-intl': { useTranslations: () => (_key, values) => `EXP ${values?.index ?? ''}` },
      '@/i18n/navigation': {
        Link: ({ href, children }) => React.createElement('a', { href }, children),
      },
      './ProjectArticle/ProjectStack': { ProjectStack: () => null },
      '../_ui/ImagesGallery': { ImagesGallery: () => null },
      '../_ui/AppLink': { AppLink: () => null },
      './ExperimentLinkIndicator': { ExperimentLinkIndicator: () => null },
    }
  );
  const markup = renderToStaticMarkup(
    React.createElement(ExperimentCard, {
      experiment: {
        hasDetailPage: true,
        slug: 'experiment',
        index: '01',
        title: 'Title',
        shortDescription: 'Card summary',
        description: 'Full article text',
      },
    })
  );
  assert.ok(markup.includes('Card summary'));
  assert.ok(!markup.includes('Full article text'));
  assert.ok(markup.includes('href="/playground/experiment"'));
});

function loadExperimentPage(experiments) {
  const locales = [];
  const mocks = {
    react: { ...require('react'), cache: (fn) => fn },
    'next/navigation': {
      notFound: () => {
        throw new Error('404');
      },
    },
    'next-intl': {
      useTranslations: () => (key, values) => (values?.index ? `EXP ${values.index}` : key),
    },
    'next-intl/server': {
      setRequestLocale: (locale) => locales.push(locale),
      getTranslations: async () => (key, values) => (values?.index ? `EXP ${values.index}` : key),
    },
    '@/i18n/navigation': { Link: 'a' },
    '@/lib/data/experiments': {
      getExperimentDetail: async (slug, locale) => {
        locales.push(locale);
        const index = experiments.findIndex((item) => item.slug === slug);
        return index < 0
          ? null
          : {
              experiment: experiments[index],
              next: experiments.length > 1 ? experiments[(index + 1) % experiments.length] : null,
            };
      },
    },
    '@/lib/seo/build-metadata': { buildPageMetadata: (input) => input },
  };
  for (const component of ['AppLink', 'ImageFrame', 'ImagesGallery', 'Label', 'MetaList']) {
    mocks[`@/app/(site)/[locale]/_components/_ui/${component}`] = {
      [component]:
        component === 'AppLink'
          ? ({ href, children }) => require('react').createElement('a', { href }, children)
          : ({ children }) => children ?? null,
    };
  }
  mocks['@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack'] = {
    ProjectStack: () => null,
  };
  return {
    ...load('src/app/(site)/[locale]/playground/[slug]/page.tsx', mocks),
    locales,
  };
}

const publicExperiment = {
  slug: 'first',
  index: '01',
  title: 'First experiment',
  shortDescription: 'Summary',
  description: 'Paragraph one\n\nParagraph two',
  stack: null,
  demoUrl: null,
  githubUrl: null,
  cover: null,
  photos: [],
};

test('experiment page shows only the selected article and links to its next sibling', async () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const page = loadExperimentPage([
    publicExperiment,
    {
      ...publicExperiment,
      slug: 'second',
      title: 'Second experiment',
      description: 'Other article',
    },
  ]);
  const params = Promise.resolve({ locale: 'uk', slug: 'first' });
  const markup = renderToStaticMarkup(await page.default({ params }));
  assert.ok(markup.includes('First experiment'));
  assert.ok(markup.includes('Paragraph one'));
  assert.ok(markup.includes('Paragraph two'));
  assert.ok(!markup.includes('Other article'));
  assert.ok(markup.includes('href="/playground/second"'));
  assert.ok(markup.includes('href="/#playground"'));
  const metadata = await page.generateMetadata({ params });
  assert.equal(metadata.pathname, '/playground/first');
  assert.equal(metadata.description, 'Summary');
  assert.ok(page.locales.every((locale) => locale === 'uk'));
});

test('missing experiments return 404 for both the article and metadata', async () => {
  const page = loadExperimentPage([publicExperiment]);
  const params = Promise.resolve({ locale: 'en', slug: 'missing' });
  await assert.rejects(page.default({ params }), /404/);
  await assert.rejects(page.generateMetadata({ params }), /404/);
});

test('a single experiment renders without a next link or media', async () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const page = loadExperimentPage([publicExperiment]);
  const markup = renderToStaticMarkup(
    await page.default({
      params: Promise.resolve({ locale: 'en', slug: 'first' }),
    })
  );
  assert.ok(!markup.includes('nextExperiment'));
  assert.ok(!markup.includes('Other article'));
});

test('experiment link gives accessible feedback while navigation is pending', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  let pending = false;
  const { ExperimentLinkIndicator } = load(
    'src/app/(site)/[locale]/_components/_layouts/ExperimentLinkIndicator.tsx',
    { 'next/link': { useLinkStatus: () => ({ pending }) } }
  );
  const render = () =>
    renderToStaticMarkup(
      React.createElement(ExperimentLinkIndicator, {
        loadingLabel: 'Завантаження експерименту…',
      })
    );
  const idle = render();
  assert.ok(idle.includes('lucide-move-up-right'));
  assert.ok(!idle.includes('role="status"'));
  pending = true;
  const loading = render();
  assert.ok(loading.includes('role="status"'));
  assert.ok(loading.includes('Завантаження експерименту…'));
  assert.ok(!loading.includes('lucide-move-up-right'));
});
