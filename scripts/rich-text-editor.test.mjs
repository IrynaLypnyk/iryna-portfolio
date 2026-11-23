import assert from 'node:assert/strict';
import test from 'node:test';
import { Window } from 'happy-dom';
import { loadTypeScript as load } from './helpers/load-typescript.mjs';

const window = new Window({ url: 'http://localhost' });
for (const key of [
  'window',
  'document',
  'navigator',
  'Node',
  'Element',
  'HTMLElement',
  'MutationObserver',
  'DOMParser',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'ClipboardEvent',
  'KeyboardEvent',
  'Event',
]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value:
      typeof window[key] === 'function' &&
      ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key)
        ? window[key].bind(window)
        : window[key],
  });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { AdminRichText } = load('src/app/(admin)/admin/(protected)/_components/AdminRichText.tsx');
const { readRichText } = load('src/lib/content/rich-text.ts');

test('visual editor formats, pastes, undoes, resets and respects disabled state', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  let value = 'Doctor search\n\nPatient dashboard';
  const render = (disabled = false) =>
    root.render(
      createElement(AdminRichText, {
        value,
        label: 'Body EN',
        disabled,
        onChangeAction: (next) => {
          value = next;
          render();
        },
      })
    );
  await act(async () => {
    render();
  });
  const textbox = host.querySelector('[role="textbox"]');
  assert.ok(textbox);
  assert.equal(textbox.textContent, 'Doctor searchPatient dashboard');
  const view = textbox.editor.view;
  const { AllSelection } = await import('@tiptap/pm/state');
  await act(async () => {
    view.dispatch(view.state.tr.setSelection(new AllSelection(view.state.doc)));
  });
  await act(async () => {
    host.querySelector('[aria-label="Numbered list"]').click();
  });
  assert.equal(textbox.querySelectorAll('ol > li').length, 2);
  assert.equal(readRichText(value).content[0].type, 'orderedList');
  await act(async () => {
    host.querySelector('[aria-label="Bold"]').click();
  });
  assert.equal(textbox.querySelectorAll('strong').length, 2);
  await act(async () => {
    host.querySelector('[aria-label="Undo"]').click();
  });
  assert.equal(textbox.querySelectorAll('strong').length, 0);
  await act(async () => {
    host.querySelector('[aria-label="Redo"]').click();
  });
  assert.equal(textbox.querySelectorAll('strong').length, 2);
  // Paste formatted content as copied from a document or chat response.
  await act(async () => {
    view.dispatch(view.state.tr.setSelection(new AllSelection(view.state.doc)));
    view.pasteHTML(
      '<ol><li><p><strong>Lab results:</strong> PDF upload</p></li><li><p>Chat</p></li></ol>'
    );
  });
  assert.ok(textbox.textContent.includes('Lab results: PDF upload'));
  assert.equal(textbox.querySelectorAll('li').length, 2);
  assert.ok(textbox.querySelector('strong'));
  await act(async () => {
    value = 'Restored original';
    render();
  });
  assert.equal(textbox.textContent, 'Restored original');
  await act(async () => {
    render(true);
  });
  assert.equal(textbox.getAttribute('contenteditable'), 'false');
  assert.ok(host.querySelector('[aria-label="Bold"]').disabled);
  await act(async () => {
    root.unmount();
  });
  host.remove();
  await window.happyDOM.abort();
});
