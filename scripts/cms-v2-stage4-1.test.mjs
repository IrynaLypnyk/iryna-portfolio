import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTypeScript as load } from './helpers/load-typescript.mjs';
const directory = 'src/app/(admin)/admin/(protected)/_components/';

test('tabs expose matching ARIA controls and keep inactive panel contents mounted', () => {
  const { EditorTabs, EditorPanel } = load(directory + 'EditorTabs.tsx');
  const tabs = { id: 'editor', tab: 'Content', setTab() {} };
  const html = renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(EditorTabs, { tabs }),
      ...['General', 'Content', 'Media', 'Settings'].map((name) =>
        React.createElement(
          EditorPanel,
          { key: name, tabs, name },
          React.createElement('input', { defaultValue: name })
        )
      )
    )
  );
  assert.equal((html.match(/role="tab"/g) ?? []).length, 4);
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 4);
  assert.equal((html.match(/hidden=""/g) ?? []).length, 3);
  assert.equal((html.match(/<input/g) ?? []).length, 4);
  assert.ok(
    html.includes('aria-controls="editor-Content-panel" aria-selected="true" tabindex="0"')
  );
});

test('shared toolbar has one submit and disables save/discard during uploads', () => {
  const { EditorSaveBar } = load(directory + 'EditorSaveBar.tsx');
  const html = renderToStaticMarkup(
    React.createElement(EditorSaveBar, {
      dirty: true,
      uploading: true,
      saving: false,
      onDiscardAction() {},
    })
  );
  assert.equal((html.match(/type="submit"/g) ?? []).length, 1);
  assert.equal((html.match(/disabled=""/g) ?? []).length, 2);
  assert.ok(html.includes('Uploading media…'));
});

test('empty compact media editor keeps direct upload but has no empty table, grid or reorder controls', () => {
  const { MediaEditor } = load(directory + 'MediaEditor.tsx', {
    '../projects/[id]/photo-manager/PhotoUploader': {
      PhotoUploader: () => React.createElement('button', { type: 'button' }, 'Upload'),
    },
    '../projects/[id]/photo-manager/AdminPhotoLightbox': { AdminPhotoLightbox: () => null },
  });
  const html = renderToStaticMarkup(
    React.createElement(MediaEditor, {
      ownerId: 'owner',
      ownerType: 'projects',
      context: 'block',
      items: [],
      onChangeAction() {},
      onUploadingChangeAction() {},
    })
  );
  assert.ok(html.includes('Upload'));
  assert.ok(!html.includes('<table'));
  assert.ok(!html.includes('<ul'));
  assert.ok(!html.includes('Move media'));
  assert.ok(!html.includes('Add cover image here'));
});

for (const [name, props, message, disabled] of [
  ['clean', {}, 'All changes saved', 2],
  ['dirty', { dirty: true }, 'Unsaved changes', 0],
  ['saving', { dirty: true, saving: true }, 'Saving changes…', 2],
  ['uploading', { dirty: true, uploading: true }, 'Uploading media…', 2],
  ['failed', { error: true }, 'Changes not saved', 0],
])
  test(`toolbar ${name} feedback and action availability`, () => {
    const { EditorSaveBar } = load(directory + 'EditorSaveBar.tsx');
    const html = renderToStaticMarkup(
      React.createElement(EditorSaveBar, {
        dirty: false,
        saving: false,
        uploading: false,
        ...props,
        onDiscardAction() {},
      })
    );
    assert.ok(html.includes(message));
    assert.equal((html.match(/disabled=""/g) ?? []).length, disabled);
    assert.ok(html.includes('aria-live="polite"'));
    assert.ok(html.includes('fixed inset-x-0'));
  });
