import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTypeScript as load } from './helpers/load-typescript.mjs';

const { readRichText, writeRichText } = load('src/lib/content/rich-text.ts');
const { CaseBody } = load('src/app/(site)/[locale]/_components/_ui/CaseBody.tsx');
const render = (body) => renderToStaticMarkup(createElement(CaseBody, { body }));

test('legacy paragraphs and single line breaks remain intact without interpreting HTML', () => {
  const html = render('First line\nsecond line\n\n<script>alert(1)</script>');
  assert.equal((html.match(/<p /g) || []).length, 2);
  assert.ok(html.includes('First line<br/>second line'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
});

test('bold labels and nested lists survive storage and render semantically', () => {
  const doc = {
    type: 'doc',
    content: [
      {
        type: 'orderedList',
        attrs: { start: 3 },
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Doctor search:', marks: [{ type: 'bold' }] },
                  { type: 'text', text: ' Improved filtering.' },
                ],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      { type: 'paragraph', content: [{ type: 'text', text: 'Responsive UI' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const value = writeRichText(doc);
  assert.equal(JSON.stringify(readRichText(value)), JSON.stringify(doc));
  const html = render(value);
  assert.ok(html.includes('start="3"'));
  assert.ok(html.includes('<strong class="font-semibold">Doctor search:</strong>'));
  assert.ok(html.includes('<ul '));
  assert.equal((html.match(/<li /g) || []).length, 2);
});

test('empty editor content is stored as empty text', () => {
  assert.equal(writeRichText({ type: 'doc', content: [{ type: 'paragraph' }] }), '');
});

test('unsupported or malformed documents cannot inject HTML or crash rendering', () => {
  for (const node of [
    { type: 'script' },
    { type: '__proto__' },
    { type: 'constructor' },
    { type: 'text', text: 'unsafe', marks: [{ type: 'link' }] },
  ]) {
    assert.throws(() => writeRichText({ type: 'doc', content: [node] }));
    assert.doesNotThrow(() =>
      render('richtext:v1:' + JSON.stringify({ type: 'doc', content: [node] }))
    );
  }
  assert.doesNotThrow(() => render('richtext:v1:{invalid'));
});
