import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTypeScript } from './helpers/load-typescript.mjs';
import {
  buildLegacyContentReport,
  readLegacyContentReport,
} from './lib/legacy-content-preflight.mjs';
const base = { projects: [], experiments: [], photos: [], assets: [], sections: [] };
const asset = {
  id: 'asset',
  imageKitFileId: 'file',
  mimeType: 'image/png',
  width: 100,
  height: 100,
  src: '/old/image.png',
};
const owner = {
  id: 'owner',
  slug: 'legacy',
  published: true,
  featuresEn: ['Feature'],
  featuresUk: ['Функція'],
};
const photo = {
  id: 'photo',
  assetId: 'asset',
  assetUkId: null,
  orderInProject: 0,
  isProjectCover: false,
};

test('implicit Experiment cover remains flagged for review and gallery change, without metadata guesses', () => {
  const input = {
    ...base,
    experiments: [owner],
    photos: [{ ...photo, experimentId: owner.id }],
    assets: [{ ...asset, mimeType: null }],
  };
  const before = JSON.stringify(input);
  const report = buildLegacyContentReport(input),
    row = report.owners[0];
  assert.equal(row.covers.legacySelection, 'implicit');
  assert.equal(row.covers.proposedByExistingMigration.default, null);
  assert.deepEqual(row.gallery.addedToAdditional, ['photo']);
  assert.deepEqual(report.assetsNeedingReview[0].issues, ['missing_mime']);
  assert.equal(row.detailPages.liveUrlVerified, false);
  assert.equal(JSON.stringify(input), before);
});
test('duplicate or invalid bilingual explicit covers are never selected for reconciliation', () => {
  for (const photos of [
    [{ ...photo, projectId: 'owner', isProjectCover: true, assetUkId: 'missing' }],
    [
      { ...photo, projectId: 'owner', isProjectCover: true },
      { ...photo, id: 'two', projectId: 'owner', isProjectCover: true },
    ],
  ]) {
    const report = buildLegacyContentReport({
      ...base,
      projects: [owner],
      photos,
      assets: [asset],
    });
    assert.ok(report.owners[0].migrationBlockers.length);
    assert.equal(report.owners[0].covers.proposedByExistingMigration.default, null);
  }
});
test('post-migration report preserves Features, sections, publication state and distinct shared usages', () => {
  const report = buildLegacyContentReport({
    ...base,
    hasV2: true,
    projects: [{ ...owner, detailPageStatus: 'DRAFT', coverAssetId: 'asset' }],
    assets: [asset],
    sections: [{ id: 's', projectId: 'owner', order: 1, bodyEn: 'Legacy' }],
    photos: [
      { ...photo, projectId: 'owner', isProjectCover: true },
      { ...photo, id: 'shared', projectId: 'owner' },
    ],
  });
  const row = report.owners[0];
  assert.equal(row.detailPages.v2Eligible, false);
  assert.deepEqual(row.features.en, ['Feature']);
  assert.deepEqual(row.sectionCopiesMissing, ['s']);
  assert.deepEqual(row.gallery.v2AdditionalPhotoIds, ['shared']);
  assert.deepEqual(row.gallery.removedFromAdditional, ['photo']);
});
test('reader uses read-only repeatable snapshot and rolls back even on failure', async () => {
  const statements = [];
  const client = {
    query: async (sql) => {
      statements.push(sql);
      if (sql.startsWith('SELECT')) throw new Error('query failed');
      return { rows: [] };
    },
  };
  await assert.rejects(readLegacyContentReport(client), /query failed/);
  assert.equal(statements[0], 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  assert.equal(statements.at(-1), 'ROLLBACK');
  assert.ok(!statements.some((sql) => /^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/.test(sql)));
});
test('reader supports pre-v2 schema without ContentBlock and does not query missing table', async () => {
  const statements = [];
  const client = {
    query: async (sql) => {
      statements.push(sql);
      if (sql.includes('current_database'))
        return { rows: [{ database: 'portfolio_case_study_v2', address: '::1' }] };
      if (sql.includes('information_schema'))
        return {
          rows: ['Project', 'Experiment', 'Photo', 'MediaAsset', 'ProjectSection'].map(
            (table_name) => ({ table_name })
          ),
        };
      return { rows: [] };
    },
  };
  const report = await readLegacyContentReport(client);
  assert.equal(report.hasV2, false);
  assert.ok(!statements.some((sql) => sql.includes('public."ContentBlock"')));
  assert.equal(statements.at(-1), 'ROLLBACK');
});

function renderFeatures(features, featuresTitle) {
  const t = (key) => key;
  t.has = () => false;
  const { ProjectCaseStudy } = loadTypeScript(
    'src/app/(site)/[locale]/projects/[slug]/_components/ProjectCaseStudy.tsx',
    {
      'next-intl': { useTranslations: () => t },
      '@/i18n/navigation': { Link: ({ children }) => React.createElement('a', null, children) },
      '@/app/(site)/[locale]/_components/_ui/AppLink': {
        AppLink: ({ children }) => React.createElement('a', null, children),
      },
      '@/app/(site)/[locale]/_components/_ui/ImageFrame': { ImageFrame: () => null },
      '@/app/(site)/[locale]/_components/_ui/ImagesGallery': { ImagesGallery: () => null },
    }
  );
  return renderToStaticMarkup(
    React.createElement(ProjectCaseStudy, {
      detail: {
        title: 'Title',
        index: '01',
        features,
        featuresTitle,
        stack: [],
        sections: [],
        photos: [],
      },
    })
  );
}
test('detail page uses existing Features markup and localized titles without blocks', () => {
  for (const [title, values] of [
    ['What I built', ['First', 'Second']],
    ['Можливості', ['Перший', 'Другий']],
  ]) {
    const html = renderFeatures(values, title);
    assert.ok(html.includes('data-component="ProjectFeatures"'));
    assert.ok(html.includes(title));
    assert.ok(html.indexOf(values[0]) < html.indexOf(values[1]));
  }
  assert.ok(renderFeatures(['Feature'], ' ').includes('labelFeatures'));
});
test('empty Features leave no heading or empty section', () => {
  for (const values of [[], ['', '   ']])
    assert.ok(!renderFeatures(values, 'Unused title').includes('CaseStudyFeatures'));
});
