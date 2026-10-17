import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTypeScript as load } from './helpers/load-typescript.mjs';

const directory = 'src/app/(admin)/admin/(protected)/_components/';
const { newContentBlock, moveContentBlock, ownerMediaInput, mediaSnapshot, reconcileOwnerMedia } =
  load('src/lib/media/owner-media-draft.ts');
const { newMediaDraft } = load('src/lib/media/media-draft.ts');
const asset = (id, mimeType = 'image/png') => ({
  id,
  imageUrl: `/${id}`,
  mimeType,
  width: 800,
  height: 600,
});
const json = (value) => JSON.parse(JSON.stringify(value));

test('empty blocks support optional bilingual text with no artificial defaults or IDs', () => {
  const first = newContentBlock('first');
  assert.deepEqual(json(first), {
    key: 'first',
    titleEn: null,
    titleUk: null,
    bodyEn: null,
    bodyUk: null,
    photos: [],
  });
  const second = newContentBlock('second');
  first.bodyEn = 'First paragraph.\n\nSecond paragraph.';
  const moved = moveContentBlock([first, second], 'second', -1);
  assert.equal(moved[0], second);
  assert.equal(moved[1], first);
  assert.equal(moveContentBlock(moved, 'second', -1), moved);
  assert.equal(first.bodyEn, 'First paragraph.\n\nSecond paragraph.');
});

test('reordering identical blocks or media usages still marks the draft dirty', () => {
  const first = newContentBlock('first');
  const second = newContentBlock('second');
  const draft = { contentBlocks: [first, second], additionalMedia: [] };
  assert.notEqual(
    mediaSnapshot(draft),
    mediaSnapshot({ ...draft, contentBlocks: [second, first] })
  );
  const image = asset('image');
  const photos = [newMediaDraft(image, 'first-usage'), newMediaDraft(image, 'second-usage')];
  assert.notEqual(
    mediaSnapshot({ ...draft, additionalMedia: photos }),
    mediaSnapshot({ ...draft, additionalMedia: [photos[1], photos[0]] })
  );
});

test('cover and collection edits share the payload without automatically moving media', () => {
  const image = asset('image');
  const ukrainian = asset('uk');
  const draft = {
    coverAsset: image,
    coverAssetUk: ukrainian,
    contentBlocks: [
      {
        ...newContentBlock('block'),
        photos: [{ ...newMediaDraft(image, 'usage'), assetUk: ukrainian }],
      },
    ],
    additionalMedia: [],
  };
  const payload = ownerMediaInput(draft);
  assert.equal(payload.coverAssetId, 'image');
  assert.equal(payload.coverAssetUkId, 'uk');
  assert.equal(payload.contentBlocks[0].photos[0].assetId, 'image');
  assert.equal(payload.additionalMedia.length, 0);
  const removed = { ...draft, contentBlocks: [] };
  assert.equal(ownerMediaInput(removed).additionalMedia.length, 0);
  assert.equal(ownerMediaInput(removed).coverAssetId, 'image');
  assert.notEqual(mediaSnapshot(removed), mediaSnapshot(draft));
  assert.notEqual(
    mediaSnapshot({ ...draft, coverAsset: asset('replacement') }),
    mediaSnapshot(draft)
  );
});

test('saved IDs reconcile without overwriting cover or block edits made during a save', () => {
  const submitted = {
    coverAsset: asset('original'),
    coverAssetUk: null,
    additionalMedia: [],
    contentBlocks: [newContentBlock('block')],
  };
  const edited = {
    ...submitted,
    coverAsset: asset('replacement'),
    contentBlocks: [{ ...submitted.contentBlocks[0], bodyUk: 'In flight' }],
  };
  const current = reconcileOwnerMedia(edited, submitted, {
    photos: [],
    contentBlocks: [{ id: 'persisted-block', photos: [] }],
  });
  assert.equal(current.coverAsset.id, 'replacement');
  assert.equal(current.contentBlocks[0].id, 'persisted-block');
  assert.equal(current.contentBlocks[0].key, 'block');
  assert.equal(current.contentBlocks[0].bodyUk, 'In flight');
});

test('block fields are optional and use textareas preserving multiple paragraphs', () => {
  const { ContentBlocksEditor } = load(directory + 'ContentBlocksEditor.tsx', {
    './MediaEditor': { MediaEditor: () => null },
  });
  const html = renderToStaticMarkup(
    React.createElement(ContentBlocksEditor, {
      blocks: [{ ...newContentBlock('key'), bodyEn: 'First paragraph.\n\nSecond paragraph.' }],
      ownerId: 'owner',
      ownerType: 'projects',
      onChangeAction() {},
      onUploadingChangeAction() {},
    })
  );
  assert.equal((html.match(/<textarea/g) ?? []).length, 2);
  assert.ok(html.includes('First paragraph.\n\nSecond paragraph.'));
  assert.ok(!html.includes('required=""'));
  assert.ok(html.includes('Move block 1 up'));
  assert.ok(html.includes('Add block'));
});

test('cover selector shows independent thumbnails and image-only uploads without a reuse picker', () => {
  const uploads = [];
  const { CoverSelector } = load(directory + 'CoverSelector.tsx', {
    '../projects/[id]/photo-manager/PhotoUploader': {
      PhotoUploader: (props) => {
        uploads.push(props);
        return null;
      },
    },
    '../projects/[id]/photo-manager/AdminPhotoLightbox': { AdminPhotoLightbox: () => null },
    './AdminMediaPreview': {
      AdminMediaPreview: ({ src }) => React.createElement('img', { src, alt: 'Image preview' }),
    },
  });
  const image = asset('image');
  const html = renderToStaticMarkup(
    React.createElement(CoverSelector, {
      ownerId: 'owner',
      ownerType: 'experiments',
      disabled: false,
      onChangeAction() {},
      onUploadingChangeAction() {},
      media: {
        coverAsset: image,
        coverAssetUk: null,
        contentBlocks: [],
        additionalMedia: [
          newMediaDraft(image, 'image'),
          newMediaDraft(asset('video', 'video/webm'), 'video'),
        ],
      },
    })
  );
  assert.equal(uploads.length, 2);
  assert.ok(uploads.every((props) => props.imagesOnly && !props.multiple));
  assert.ok(!html.includes('Reuse an image from this form'));
  assert.ok(!html.includes('Use as default'));
  assert.ok(html.includes('<img'));
  assert.ok(!html.includes('isProjectCover'));
});

test('detail publication control has three choices and explains the private transition', () => {
  const { DetailPageSettings } = load(directory + 'DetailPageSettings.tsx');
  const html = renderToStaticMarkup(
    React.createElement(DetailPageSettings, {
      value: 'DRAFT',
      onChangeAction() {},
      disabled: false,
    })
  );
  assert.equal((html.match(/<option /g) ?? []).length, 3);
  assert.ok(html.includes('value="DRAFT" selected=""'));
  assert.ok(html.includes('stay private'));
  assert.ok(!html.includes('required=""'));
});
