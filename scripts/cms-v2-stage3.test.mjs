import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTypeScript as load } from './helpers/load-typescript.mjs';

const directory = 'src/app/(admin)/admin/(protected)/projects/[id]/photo-manager/';
const asset = (id = 'asset', mimeType = 'image/png') => ({
  id,
  mimeType,
  imageUrl: `/${id}`,
  width: 800,
  height: 600,
});
const { newMediaDraft, mediaInput, reconcileMediaIds, mediaMime } = load(
  'src/lib/media/media-draft.ts'
);
const { ownerMediaInput, mediaSnapshot, reconcileOwnerMedia } = load(
  'src/lib/media/owner-media-draft.ts'
);
const json = (value) => JSON.parse(JSON.stringify(value));

test('draft payload preserves metadata, localized references, order and persisted IDs only', () => {
  const first = {
    ...newMediaDraft(asset(), 'key-1'),
    id: 'photo',
    captionEn: 'Caption',
    captionUk: 'Підпис',
    descriptionEn: 'Description',
    descriptionUk: 'Опис',
    linkUrl: 'https://example.com',
    assetUk: asset('uk'),
  };
  const second = newMediaDraft(asset('video', 'video/webm'), 'key-2');
  const payload = mediaInput([second, first]);
  assert.deepEqual(json(payload[1]), {
    id: 'photo',
    assetId: 'asset',
    assetUkId: 'uk',
    captionEn: 'Caption',
    captionUk: 'Підпис',
    descriptionEn: 'Description',
    descriptionUk: 'Опис',
    linkUrl: 'https://example.com',
  });
  assert.equal(payload[0].id, undefined);
  assert.equal(payload[0].assetId, 'video');
  assert.ok(!JSON.stringify(payload).includes('key-'));
  assert.ok(!JSON.stringify(payload).includes('legacyCover'));
});

test('new block payload needs no block ID; reconciliation keeps keys and edits made during save', () => {
  const submitted = {
    additionalMedia: [],
    contentBlocks: [
      {
        key: 'new-block',
        titleEn: null,
        titleUk: null,
        bodyEn: null,
        bodyUk: null,
        photos: [newMediaDraft(asset(), 'new-photo')],
      },
    ],
  };
  assert.equal(ownerMediaInput(submitted).contentBlocks[0].id, undefined);
  const saved = { photos: [], contentBlocks: [{ id: 'block', photos: [{ id: 'photo' }] }] };
  const reconciled = reconcileOwnerMedia(submitted, submitted, saved);
  assert.equal(reconciled.contentBlocks[0].id, 'block');
  assert.equal(reconciled.contentBlocks[0].photos[0].id, 'photo');
  assert.equal(reconciled.contentBlocks[0].key, 'new-block');
  assert.equal(mediaSnapshot(reconciled), mediaSnapshot(submitted));
  const edited = { ...submitted.contentBlocks[0].photos[0], captionEn: 'In flight' };
  const [result] = reconcileMediaIds([edited], submitted.contentBlocks[0].photos, [
    { id: 'photo' },
  ]);
  assert.equal(result.captionEn, 'In flight');
  assert.equal(result.id, 'photo');
});

function hookHarness(ownerType, options = {}) {
  let cursor = 0;
  const slots = [];
  const calls = { requests: [], uploaded: [], busy: [], errors: [], sdk: [] };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [
        slots[index],
        (update) => {
          slots[index] = typeof update === 'function' ? update(slots[index]) : update;
        },
      ];
    },
    useRef(initial) {
      return react.useState({ current: initial })[0];
    },
  };
  const { usePhotoUpload: runUploadHook } = load(directory + 'usePhotoUpload.ts', {
    react,
    sonner: { toast: { error: (message) => calls.errors.push(message) } },
    '@imagekit/javascript': {
      upload: async (props) => {
        calls.sdk.push(props);
        props.onProgress({ loaded: 5, total: 10 });
        if (options.wait) await options.wait;
        if (props.file.name === 'fail.webm') throw new Error('Upload failed');
        return { fileId: props.file.name };
      },
    },
    fetch: async (url, init) => {
      calls.requests.push({ url, init });
      return {
        ok: !options.registrationFailure,
        json: async () =>
          init
            ? { asset: asset(JSON.parse(init.body).fileId), message: 'Registration failed' }
            : {
                token: 'token',
                signature: 'signature',
                expire: 1,
                publicKey: 'public',
                folder: '/test',
              },
      };
    },
  });
  const render = () => {
    cursor = 0;
    return runUploadHook({
      ownerType,
      projectId: 'owner',
      imagesOnly: options.imagesOnly,
      onUploadingChangeAction: (busy) => calls.busy.push(busy),
      onAssetUploadedAction: (uploaded) => calls.uploaded.push(uploaded),
    });
  };
  return { calls, render };
}
const file = (name, type) => ({ name, type, size: 1024 });
for (const ownerType of ['projects', 'experiments']) {
  test(`${ownerType}: multiple direct uploads register assets, report progress and never persist associations`, async () => {
    const { calls, render } = hookHarness(ownerType);
    const target = {
      value: 'files',
      files: [file('a.png', 'image/png'), file('b.webm', 'video/webm')],
    };
    await render().handleFileChange({ target });
    assert.equal(target.value, '');
    assert.equal(calls.uploaded.length, 2);
    assert.deepEqual(calls.busy, [true, false]);
    assert.equal(calls.sdk[1].overwriteFile, false);
    assert.equal(render().isUploading, false);
    assert.ok(render().uploadItems.every((item) => item.status === 'done' && item.progress === 50));
    for (const { url } of calls.requests) {
      assert.ok(url.includes(`/api/admin/${ownerType}/owner/photos/`));
    }
    assert.deepEqual(
      calls.requests
        .filter((request) => request.init)
        .map((request) => JSON.parse(request.init.body)),
      [{ fileId: 'a.png' }, { fileId: 'b.webm' }]
    );
  });
}

test('upload failures remain visible, later files still upload, invalid types never reach ImageKit', async () => {
  const { calls, render } = hookHarness('projects');
  await render().handleFileChange({
    target: {
      value: '',
      files: [
        file('bad.mov', 'video/quicktime'),
        file('fail.webm', 'video/webm'),
        file('ok.png', 'image/png'),
      ],
    },
  });
  assert.equal(calls.errors.length, 1);
  assert.equal(calls.uploaded.length, 1);
  assert.equal(render().uploadItems[0].errorMessage, 'Upload failed');
  assert.equal(render().uploadItems[1].status, 'done');
  assert.deepEqual(calls.busy, [true, false]);
});

test('failed registration creates no draft usage; pending upload is visible until registration finishes', async () => {
  let release;
  const wait = new Promise((resolve) => {
    release = resolve;
  });
  const { calls, render } = hookHarness('experiments', { wait });
  const pending = render().handleFileChange({
    target: { value: '', files: [file('a.png', 'image/png')] },
  });
  assert.equal(render().isUploading, true);
  assert.equal(calls.uploaded.length, 0);
  release();
  await pending;
  assert.equal(calls.uploaded.length, 1);
  const failed = hookHarness('projects', { registrationFailure: true });
  await failed
    .render()
    .handleFileChange({ target: { value: '', files: [file('a.png', 'image/png')] } });
  assert.equal(failed.calls.uploaded.length, 0);
  assert.equal(failed.render().uploadItems[0].status, 'error');
});

test('MP4 and WebM without legacy MIME use video previews, never Next Image', () => {
  const { AdminMediaPreview } = load(
    'src/app/(admin)/admin/(protected)/_components/AdminMediaPreview.tsx',
    {
      'next/image': { default: () => React.createElement('img') },
    }
  );
  for (const extension of ['webm', 'mp4']) {
    const preview = asset('clip.' + extension, null);
    const html = renderToStaticMarkup(
      React.createElement(AdminMediaPreview, {
        src: preview.imageUrl,
        mimeType: mediaMime(preview),
      })
    );
    assert.ok(html.includes('<video'));
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('preload="metadata"'));
  }
});

function cleanupHarness(options = {}) {
  const events = [];
  const { deleteMediaAssetIfUnused, cleanupMediaAssets } = load(
    'src/lib/media/delete-media-asset.ts',
    {
      './file-lock': {
        withMediaFileLock: async (id, action) => {
          events.push('lock:' + id);
          return action();
        },
      },
      '@/lib/prisma': {
        prisma: {
          mediaAsset: {
            findFirst: async ({ where }) => {
              for (const relation of [
                'defaultForPhotos',
                'ukrainianForPhotos',
                'projectCovers',
                'projectCoversUk',
                'experimentCovers',
                'experimentCoversUk',
              ])
                assert.ok(where[relation].none);
              return options.shared ? null : { imageKitFileId: 'file' };
            },
            deleteMany: async () => {
              events.push('db-commit');
              if (options.dbFailure) throw new Error('FK conflict');
              return { count: options.lateReference ? 0 : 1 };
            },
          },
        },
      },
      '@/lib/imagekit/client': {
        getImageKit: () => ({
          files: {
            get: async () => {
              events.push('verify');
              if (options.missing) throw { status: 404 };
              if (options.verifyFailure) throw new Error('ImageKit unavailable');
              return { filePath: '/safe/file' };
            },
            delete: async () => {
              events.push('imagekit-delete');
              if (options.deleteFailure) throw new Error('ImageKit unavailable');
            },
          },
        }),
      },
      '@/lib/imagekit/assertSafeImageKitPath': {
        assertSafeImageKitPath: (src) => assert.ok(src.startsWith('/safe/')),
      },
    }
  );
  return { events, deleteMediaAssetIfUnused, cleanupMediaAssets };
}

test('cleanup protects shared and cover-only assets, including a reference added after the first check', async () => {
  const shared = cleanupHarness({ shared: true });
  assert.equal((await shared.deleteMediaAssetIfUnused('asset')).deleted, false);
  assert.deepEqual(shared.events, []);
  const late = cleanupHarness({ lateReference: true });
  assert.equal((await late.deleteMediaAssetIfUnused('asset')).deleted, false);
  assert.ok(!late.events.includes('imagekit-delete'));
});

test('cleanup commits conditional DB deletion before ImageKit; DB/verification failures never delete files', async () => {
  const success = cleanupHarness();
  assert.equal((await success.deleteMediaAssetIfUnused('asset')).deleted, true);
  assert.deepEqual(success.events, ['lock:file', 'verify', 'db-commit', 'imagekit-delete']);
  for (const option of ['dbFailure', 'verifyFailure']) {
    const failed = cleanupHarness({ [option]: true });
    await assert.rejects(failed.deleteMediaAssetIfUnused('asset'));
    assert.ok(!failed.events.includes('imagekit-delete'));
  }
  const missing = cleanupHarness({ missing: true });
  assert.equal((await missing.deleteMediaAssetIfUnused('asset')).deleted, true);
  assert.ok(!missing.events.includes('imagekit-delete'));
});

test('cleanup failures are separate from saved content and duplicate candidates are attempted once', async (t) => {
  t.mock.method(console, 'error', () => {});
  const { cleanupMediaAssets, events } = cleanupHarness({ deleteFailure: true });
  const result = await cleanupMediaAssets(['asset', 'asset', null]);
  assert.deepEqual(json(result), { failedAssetIds: ['asset'], deletedAssetIds: [] });
  assert.equal(events.filter((event) => event === 'imagekit-delete').length, 1);
});

for (const ownerType of ['projects', 'experiments']) {
  test(`${ownerType}: authenticated main save cleans candidates after commit and returns warnings without failing the save`, async () => {
    const events = [];
    const singular = ownerType === 'projects' ? 'project' : 'experiment';
    let fails = false;
    const route = load(`src/app/api/admin/${ownerType}/[id]/route.ts`, {
      'next/server': {
        NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) },
      },
      'next/cache': { revalidateTag: () => events.push('invalidate') },
      '@/lib/auth': { requireAuth: async () => events.push('auth') },
      '@/lib/prisma': { prisma: {} },
      '@/lib/api/prisma-errors': { isRecordNotFoundError: () => false },
      '@/lib/content/save': {
        [ownerType === 'projects' ? 'saveProject' : 'saveExperiment']: async () => {
          if (fails) throw new Error('Rollback');
          events.push('commit');
          return { [singular]: { slug: 'slug' }, cleanupCandidateAssetIds: ['asset'] };
        },
      },
      '@/lib/content/http': { contentSaveErrorResponse: () => ({ status: 400 }) },
      '@/lib/media/delete-media-asset': {
        cleanupMediaAssets: async (ids) => {
          events.push('cleanup');
          assert.equal(ids[0], 'asset');
          return { failedAssetIds: ['asset'] };
        },
      },
    });
    const request = { json: async () => ({ additionalMedia: [] }) };
    const context = { params: Promise.resolve({ id: 'owner' }) };
    const response = await route.PATCH(request, context);
    assert.equal(response.status, 200);
    assert.equal(response.body.cleanup.failedAssetIds[0], 'asset');
    assert.ok(events.indexOf('commit') < events.indexOf('cleanup'));
    events.length = 0;
    fails = true;
    assert.equal((await route.PATCH(request, context)).status, 400);
    assert.ok(!events.includes('cleanup'));
  });
}

test('Stage 4 cover uploads reject videos while using the shared image upload workflow', async () => {
  const { calls, render } = hookHarness('projects', { imagesOnly: true });
  await render().handleFileChange({
    target: {
      value: '',
      files: [file('video.webm', 'video/webm'), file('image.png', 'image/png')],
    },
  });
  assert.equal(calls.errors.length, 1);
  assert.equal(calls.sdk.length, 1);
  assert.equal(calls.sdk[0].file.name, 'image.png');
  assert.equal(calls.uploaded.length, 1);
});
