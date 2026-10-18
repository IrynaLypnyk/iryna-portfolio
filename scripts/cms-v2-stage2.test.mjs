import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { register } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadTypeScript } from './helpers/load-typescript.mjs';

register('./helpers/typescript-loader.mjs', import.meta.url);
process.env.IMAGEKIT_ROOT_FOLDER = '/cms-v2-stage2-test';
const { PrismaClient } = await import('../src/generated/prisma/client.ts');
const { saveProject, saveExperiment, ContentSaveError } = await import(
  '../src/lib/content/save.ts'
);
const { validateProjectInput } = await import('../src/lib/content/project-input.ts');
const { validateExperimentInput } = await import('../src/lib/content/experiment-input.ts');
const { unusedMediaAssetWhere } = await import('../src/lib/media/unused-media-asset.ts');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const connectionString = dotenv.parse(readFileSync(path.join(root, '.env.local'))).DATABASE_URL;
const target = new URL(connectionString);
assert.equal(target.pathname, '/portfolio_case_study_v2');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(target.hostname));
assert.ok(['postgresql:', 'postgres:'].includes(target.protocol));
assert.ok([...target.searchParams.keys()].every((key) => key === 'schema'));
process.env.DATABASE_URL = connectionString;
const migrationRoot = path.join(root, 'prisma/migrations');
const migrations = readdirSync(migrationRoot)
  .filter((name) => /^\d/.test(name))
  .sort();
assert.equal(migrations.length, 11);

async function publicSnapshot(client) {
  const result = {};
  for (const table of [
    'Project',
    'Experiment',
    'ProjectSection',
    'ContentBlock',
    'Photo',
    'MediaAsset',
    '_prisma_migrations',
  ]) {
    result[table] = (
      await client.query(`SELECT to_jsonb(t) AS row FROM public."${table}" t ORDER BY id`)
    ).rows;
  }
  return result;
}

// Actual Prisma transactions require committed scratch-schema DDL. Never write
// fixtures into public; drop the isolated schema and verify public is unchanged.
async function withDatabase(run) {
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 5000 });
  const schema = `cms_v2_stage2_test_${randomUUID().replaceAll('-', '')}`;
  let db;
  let before;
  let created = false;
  try {
    await client.connect();
    const live = (
      await client.query('SELECT current_database() AS db, host(inet_server_addr()) AS address')
    ).rows[0];
    assert.equal(live.db, 'portfolio_case_study_v2');
    assert.ok(['127.0.0.1', '::1'].includes(live.address));
    before = await publicSnapshot(client);
    await client.query(`CREATE SCHEMA "${schema}"`);
    created = true;
    await client.query(`SET search_path TO "${schema}", pg_catalog`);
    for (const name of migrations)
      await client.query(readFileSync(path.join(migrationRoot, name, 'migration.sql'), 'utf8'));
    db = new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema }) });
    await run(db);
  } finally {
    if (db) await db.$disconnect();
    if (created) {
      await client.query('ROLLBACK');
      await client.query(`DROP SCHEMA "${schema}" CASCADE`);
      assert.deepEqual(await publicSnapshot(client), before, 'Public data must remain unchanged');
    }
    await client.end();
  }
}

const minimal = (slug = `project-${randomUUID()}`) => ({
  slug,
  titleEn: 'Title',
  titleUk: 'Назва',
});
const experimentInput = () => ({
  ...minimal(),
  descriptionEn: 'Description',
  descriptionUk: 'Опис',
});
async function upload(db, owner, type = 'projects', mimeType = 'image/png') {
  const id = randomUUID();
  return db.mediaAsset.create({
    data: {
      imageKitFileId: id,
      src: `/cms-v2-stage2-test/${type}/${owner.slug}/photos/${id}`,
      mimeType,
      width: 800,
      height: 600,
    },
  });
}

test('Zod accepts only required Project fields, rejects malformed values and preserves PATCH omission', () => {
  assert.ok(validateProjectInput(minimal()).data);
  assert.deepEqual(validateProjectInput({}, 'patch').data, {});
  assert.deepEqual(validateProjectInput({ roleEn: '   ', leadUk: null }, 'patch').data, {
    roleEn: null,
    leadUk: null,
  });
  for (const input of [
    {},
    { ...minimal(), titleEn: ' ' },
    { ...minimal(), published: 'false' },
    { ...minimal(), roleEn: 42 },
    { ...minimal(), stack: null },
    { ...minimal(), externalUrl: 'javascript:alert(1)' },
  ]) {
    assert.ok(validateProjectInput(input).error);
  }
  assert.ok(validateProjectInput({ contentBlocks: [{ projectId: 'injected' }] }, 'patch').error);
  assert.ok(
    validateProjectInput(
      { additionalMedia: [{ assetId: 'asset', experimentId: 'injected' }] },
      'patch'
    ).error
  );
  assert.ok(
    validateProjectInput({ contentBlocks: [{ id: 'missing', photos: null }] }, 'patch').error
  );
  assert.ok(validateProjectInput({ additionalMedia: [{}] }, 'patch').error);
  assert.deepEqual(validateExperimentInput({}, 'patch').data, {});
});

test('minimal create, clearing every nullable Project field, omitted PATCH values and defaults', () =>
  withDatabase(async (db) => {
    const { project } = await saveProject(db, minimal());
    assert.equal(project.status, 'COMPLETED');
    assert.equal(project.published, true);
    assert.equal(project.featured, false);
    assert.equal(project.order, 0);
    assert.equal(project.detailPageStatus, 'NONE');
    assert.deepEqual(project.stack, []);
    const nullable = [
      'shortLabel',
      'subtitleEn',
      'subtitleUk',
      'contextEn',
      'contextUk',
      'leadEn',
      'leadUk',
      'roleEn',
      'roleUk',
    ];
    for (const key of nullable) assert.equal(project[key], null);
    const populated = Object.fromEntries(nullable.map((key) => [key, ' value ']));
    await saveProject(
      db,
      {
        ...populated,
        status: 'ARCHIVED',
        order: 8,
        published: false,
        featured: true,
        stack: [' React ', ''],
        featuresEn: ['Feature'],
        featuresUk: ['Можливість'],
      },
      project.id
    );
    const { project: partial } = await saveProject(db, { titleEn: 'Updated' }, project.id);
    for (const key of nullable) assert.equal(partial[key], 'value');
    assert.equal(partial.status, 'ARCHIVED');
    assert.equal(partial.order, 8);
    assert.equal(partial.published, false);
    assert.equal(partial.featured, true);
    assert.deepEqual(partial.stack, ['React']);
    assert.deepEqual(partial.featuresEn, ['Feature']);
    assert.deepEqual(partial.featuresUk, ['Можливість']);
    const { project: cleared } = await saveProject(
      db,
      Object.fromEntries(nullable.map((key, index) => [key, index % 2 ? null : '  '])),
      project.id
    );
    for (const key of nullable) assert.equal(cleared[key], null);
  }));

for (const type of ['project', 'experiment']) {
  const save = type === 'project' ? saveProject : saveExperiment;
  test(`${type}: creates and updates stable block/Photo IDs, ordering and bilingual metadata`, () =>
    withDatabase(async (db) => {
      const first = await save(db, type === 'project' ? minimal() : experimentInput());
      const owner = first[type];
      const image = await upload(db, owner, `${type === 'project' ? 'projects' : 'experiments'}`);
      const uk = await upload(
        db,
        owner,
        type === 'project' ? 'projects' : 'experiments',
        'image/webp'
      );
      const video = await upload(
        db,
        owner,
        type === 'project' ? 'projects' : 'experiments',
        'video/mp4'
      );
      const initial = (
        await save(
          db,
          {
            contentBlocks: [
              {
                titleEn: ' First ',
                bodyUk: 'Перший\n\nДругий',
                photos: [
                  {
                    assetId: image.id,
                    assetUkId: uk.id,
                    captionEn: ' Caption ',
                    captionUk: 'Підпис',
                    descriptionEn: 'Description',
                    descriptionUk: 'Опис',
                    linkUrl: 'https://example.com/demo',
                  },
                  { assetId: video.id },
                ],
              },
              { bodyEn: 'Text only' },
              { photos: [{ assetId: image.id }] },
            ],
            additionalMedia: [{ assetId: image.id, assetUkId: uk.id, captionEn: 'Additional' }],
          },
          owner.id
        )
      )[type];
      const [firstBlock, textBlock, mediaBlock] = initial.contentBlocks;
      assert.equal(firstBlock.titleEn, 'First');
      assert.equal(firstBlock.bodyUk, 'Перший\n\nДругий');
      assert.equal(textBlock.photos.length, 0);
      assert.equal(mediaBlock.titleEn, null);
      assert.equal(mediaBlock.bodyEn, null);
      const [one, two] = firstBlock.photos;
      const additional = initial.photos.find((photo) => photo.contentBlockId === null);
      const updated = (
        await save(
          db,
          {
            contentBlocks: [
              { id: mediaBlock.id },
              { id: firstBlock.id, titleEn: null, photos: [{ id: two.id }, { id: one.id }] },
              { id: textBlock.id },
            ],
          },
          owner.id
        )
      )[type];
      assert.deepEqual(
        updated.contentBlocks.map((block) => block.id),
        [mediaBlock.id, firstBlock.id, textBlock.id]
      );
      assert.deepEqual(
        updated.contentBlocks.map((block) => block.order),
        [1, 2, 3]
      );
      const reordered = updated.contentBlocks[1];
      assert.equal(reordered.titleEn, null);
      assert.deepEqual(
        reordered.photos.map((photo) => photo.id),
        [two.id, one.id]
      );
      assert.deepEqual(
        reordered.photos.map((photo) => photo.orderInProject),
        [1, 2]
      );
      assert.equal(reordered.photos[1].captionEn, 'Caption');
      assert.equal(reordered.photos[1].captionUk, 'Підпис');
      assert.equal(reordered.photos[1].descriptionUk, 'Опис');
      assert.equal(reordered.photos[1].linkUrl, 'https://example.com/demo');
      assert.equal(reordered.photos[1].assetUkId, uk.id);
      assert.equal(updated.contentBlocks[0].photos[0].id, mediaBlock.photos[0].id);
      assert.ok(updated.photos.some((photo) => photo.id === additional.id));
      const omitted = (await save(db, { titleEn: 'Metadata update' }, owner.id))[type];
      assert.deepEqual(
        omitted.contentBlocks.map((block) => block.id),
        updated.contentBlocks.map((block) => block.id)
      );
    }));

  test(`${type}: deleting blocks/usages preserves independent covers and returns cleanup candidates`, () =>
    withDatabase(async (db) => {
      const owner = (await save(db, type === 'project' ? minimal() : experimentInput()))[type];
      const image = await upload(db, owner, type === 'project' ? 'projects' : 'experiments');
      const uk = await upload(db, owner, type === 'project' ? 'projects' : 'experiments');
      const initial = (
        await save(
          db,
          {
            coverAssetId: image.id,
            coverAssetUkId: uk.id,
            contentBlocks: [{ photos: [{ assetId: image.id, assetUkId: uk.id }] }],
            additionalMedia: [
              { assetId: image.id, captionEn: 'First' },
              { assetId: uk.id, captionEn: 'Second' },
            ],
          },
          owner.id
        )
      )[type];
      const [first, second] = initial.photos.filter((photo) => photo.contentBlockId === null);
      const reordered = (
        await save(db, { additionalMedia: [{ id: second.id }, { id: first.id }] }, owner.id)
      )[type];
      assert.deepEqual(
        reordered.photos.filter((photo) => photo.contentBlockId === null).map((photo) => photo.id),
        [second.id, first.id]
      );
      const removal = await save(
        db,
        { contentBlocks: [], additionalMedia: [{ id: first.id }] },
        owner.id
      );
      assert.equal(removal[type].contentBlocks.length, 0);
      assert.deepEqual(
        removal[type].photos.map((photo) => photo.id),
        [first.id]
      );
      assert.equal(removal[type].coverAssetId, image.id);
      assert.equal(removal[type].coverAssetUkId, uk.id);
      assert.deepEqual(new Set(removal.cleanupCandidateAssetIds), new Set([image.id, uk.id]));
      assert.equal(await db.mediaAsset.count(), 2, 'Stage 2 never physically cleans up assets');
      assert.equal(
        await db.mediaAsset.count({ where: unusedMediaAssetWhere(uk.id) }),
        0,
        'Cover protects an otherwise unused asset'
      );
      await save(db, { additionalMedia: [] }, owner.id);
      assert.equal(await db.photo.count(), 0);
      for (const cover of [image, uk]) {
        assert.equal(await db.mediaAsset.count({ where: unusedMediaAssetWhere(cover.id) }), 0);
      }
      const cleared = await save(
        db,
        { additionalMedia: [], coverAssetId: null, coverAssetUkId: null },
        owner.id
      );
      assert.equal(cleared[type].photos.length, 0);
      assert.equal(cleared[type].coverAssetId, null);
      assert.equal(await db.mediaAsset.count({ where: unusedMediaAssetWhere(uk.id) }), 1);
    }));
}

test('rejects foreign block, Photo, default/UK asset and cover associations; rolls back scalar changes', () =>
  withDatabase(async (db) => {
    const owner = (await saveProject(db, minimal())).project;
    const other = (await saveProject(db, minimal())).project;
    const experiment = (await saveExperiment(db, experimentInput())).experiment;
    const foreignImage = await upload(db, other);
    const experimentImage = await upload(db, experiment, 'experiments');
    const ownImage = await upload(db, owner);
    const foreignBlock = await db.contentBlock.create({ data: { projectId: other.id } });
    const experimentBlock = await db.contentBlock.create({ data: { experimentId: experiment.id } });
    const foreignPhoto = await db.photo.create({
      data: { projectId: other.id, assetId: foreignImage.id },
    });
    const experimentPhoto = await db.photo.create({
      data: { experimentId: experiment.id, assetId: experimentImage.id },
    });
    const misleadingPath = await upload(db, owner);
    await db.photo.create({ data: { projectId: other.id, assetId: misleadingPath.id } });
    const foreignCover = await upload(db, owner);
    await db.experiment.update({
      where: { id: experiment.id },
      data: { coverAssetId: foreignCover.id },
    });
    const failures = [
      { contentBlocks: [{ id: foreignBlock.id }] },
      { contentBlocks: [{ id: experimentBlock.id }] },
      { contentBlocks: [{ photos: [{ id: foreignPhoto.id }] }] },
      { additionalMedia: [{ id: experimentPhoto.id }] },
      { additionalMedia: [{ assetId: foreignImage.id }] },
      { additionalMedia: [{ assetId: ownImage.id, assetUkId: experimentImage.id }] },
      { coverAssetId: foreignImage.id },
      { coverAssetId: ownImage.id, coverAssetUkId: experimentImage.id },
      { additionalMedia: [{ assetId: misleadingPath.id }] },
      { coverAssetId: foreignCover.id },
    ];
    for (const input of failures) {
      await assert.rejects(
        saveProject(db, { titleEn: 'Must roll back', ...input }, owner.id),
        ContentSaveError
      );
      assert.equal(
        (await db.project.findUniqueOrThrow({ where: { id: owner.id } })).titleEn,
        'Title'
      );
      assert.equal(await db.contentBlock.count({ where: { projectId: owner.id } }), 0);
    }
    await assert.rejects(
      saveExperiment(db, { additionalMedia: [{ id: foreignPhoto.id }] }, experiment.id),
      ContentSaveError
    );
  }));

test('late invalid asset rolls back newly created blocks, Photos and changes to a cover', () =>
  withDatabase(async (db) => {
    const owner = (await saveProject(db, minimal())).project;
    const image = await upload(db, owner);
    await assert.rejects(
      saveProject(
        db,
        {
          coverAssetId: image.id,
          titleEn: 'Rollback',
          contentBlocks: [
            { titleEn: 'Created before failure', photos: [{ assetId: image.id }] },
            { photos: [{ assetId: 'missing' }] },
          ],
        },
        owner.id
      ),
      ContentSaveError
    );
    assert.equal(await db.contentBlock.count(), 0);
    assert.equal(await db.photo.count(), 0);
    const unchanged = await db.project.findUniqueOrThrow({ where: { id: owner.id } });
    assert.equal(unchanged.titleEn, 'Title');
    assert.equal(unchanged.coverAssetId, null);
    await assert.rejects(
      saveProject(db, {
        ...minimal('failed-create'),
        contentBlocks: [{ photos: [{ assetId: 'missing' }] }],
      }),
      ContentSaveError
    );
    assert.equal(await db.project.count({ where: { slug: 'failed-create' } }), 0);
  }));

test('covers require verified images and a valid default while preserving omitted Ukrainian selection', () =>
  withDatabase(async (db) => {
    const owner = (await saveProject(db, minimal())).project;
    const image = await upload(db, owner);
    const uk = await upload(db, owner, 'projects', 'image/webp');
    const video = await upload(db, owner, 'projects', 'video/mp4');
    const unknown = await upload(db, owner, 'projects', null);
    for (const input of [
      { coverAssetId: video.id },
      { coverAssetId: unknown.id },
      { coverAssetUkId: uk.id },
      { coverAssetId: image.id, coverAssetUkId: video.id },
    ]) {
      await assert.rejects(saveProject(db, input, owner.id), ContentSaveError);
    }
    await saveProject(db, { coverAssetId: image.id, coverAssetUkId: uk.id }, owner.id);
    assert.equal(await db.photo.count(), 0, 'A cover never creates a Photo usage');
    const next = await upload(db, owner);
    const changed = await saveProject(db, { coverAssetId: next.id }, owner.id);
    assert.equal(changed.project.coverAssetUkId, uk.id);
    assert.ok(changed.cleanupCandidateAssetIds.includes(image.id));
    await assert.rejects(saveProject(db, { coverAssetId: null }, owner.id), ContentSaveError);
  }));

test('rejects duplicate IDs, injected ownership and already inconsistent stored Photo ownership', () =>
  withDatabase(async (db) => {
    const owner = (await saveProject(db, minimal())).project;
    const other = (await saveExperiment(db, experimentInput())).experiment;
    const image = await upload(db, owner);
    const block = await db.contentBlock.create({ data: { projectId: owner.id } });
    const photo = await db.photo.create({ data: { projectId: owner.id, assetId: image.id } });
    await assert.rejects(
      saveProject(db, { contentBlocks: [{ id: block.id }, { id: block.id }] }, owner.id),
      ContentSaveError
    );
    await assert.rejects(
      saveProject(
        db,
        {
          additionalMedia: [{ id: photo.id }],
          contentBlocks: [{ id: block.id, photos: [{ id: photo.id }] }],
        },
        owner.id
      ),
      ContentSaveError
    );
    await assert.rejects(
      saveProject(
        db,
        { contentBlocks: [{ projectId: owner.id, experimentId: other.id }] },
        owner.id
      ),
      ContentSaveError
    );
    const foreign = await db.contentBlock.create({ data: { experimentId: other.id } });
    await db.photo.update({ where: { id: photo.id }, data: { contentBlockId: foreign.id } });
    await assert.rejects(
      saveProject(db, { titleEn: 'Rejected' }, owner.id),
      /different owner's block/
    );
  }));

test('legacy sections and Features retain stable IDs, order and omitted PATCH values', () =>
  withDatabase(async (db) => {
    const section = {
      titleEn: 'Heading',
      titleUk: 'Заголовок',
      bodyEn: 'Body',
      bodyUk: 'Текст',
      body2En: 'Second',
    };
    const owner = (
      await saveProject(db, {
        ...minimal(),
        sections: [section],
        featuresEn: ['Feature'],
        featuresUk: ['Можливість'],
      })
    ).project;
    const first = owner.sections[0];
    const unchanged = (await saveProject(db, { roleEn: 'Role' }, owner.id)).project;
    assert.equal(unchanged.sections[0].id, first.id);
    const edited = (
      await saveProject(
        db,
        {
          sections: [{ id: first.id, ...section, bodyEn: 'Edited' }],
          featuresTitleEn: ' Features ',
        },
        owner.id
      )
    ).project;
    assert.equal(edited.sections[0].id, first.id);
    assert.equal(edited.sections[0].bodyEn, 'Edited');
    assert.deepEqual(edited.featuresEn, ['Feature']);
    assert.equal(edited.featuresTitleEn, 'Features');
    const cleared = (
      await saveProject(db, { sections: [], featuresEn: [], featuresUk: [] }, owner.id)
    ).project;
    assert.equal(cleared.sections.length, 0);
    assert.deepEqual(cleared.featuresEn, []);
  }));

test('localised usage replacement and explicit same-owner movement preserve identity', () =>
  withDatabase(async (db) => {
    const owner = (await saveProject(db, minimal())).project;
    const image = await upload(db, owner);
    const uk = await upload(db, owner);
    const initial = (
      await saveProject(
        db,
        {
          contentBlocks: [
            { photos: [{ assetId: image.id, assetUkId: uk.id, captionUk: 'Підпис' }] },
          ],
        },
        owner.id
      )
    ).project;
    const photo = initial.contentBlocks[0].photos[0];
    const moved = (
      await saveProject(db, { contentBlocks: [], additionalMedia: [{ id: photo.id }] }, owner.id)
    ).project;
    assert.equal(moved.photos[0].id, photo.id);
    assert.equal(moved.photos[0].contentBlockId, null);
    assert.equal(moved.photos[0].assetUkId, uk.id);
    const cleared = await saveProject(
      db,
      { additionalMedia: [{ id: photo.id, assetUkId: null }] },
      owner.id
    );
    assert.equal(cleared.project.photos[0].captionUk, 'Підпис');
    assert.equal(cleared.project.photos[0].assetUkId, null);
    assert.ok(cleared.cleanupCandidateAssetIds.includes(uk.id));
  }));

test('legacy cover Photos cannot be changed to video through the shared save', () =>
  withDatabase(async (db) => {
    const owner = (await saveProject(db, minimal())).project;
    const image = await upload(db, owner);
    const video = await upload(db, owner, 'projects', 'video/mp4');
    const photo = await db.photo.create({
      data: { projectId: owner.id, assetId: image.id, isProjectCover: true },
    });
    for (const fields of [{ assetId: video.id }, { assetUkId: video.id }]) {
      await assert.rejects(
        saveProject(db, { additionalMedia: [{ id: photo.id, ...fields }] }, owner.id),
        ContentSaveError
      );
    }
    const unchanged = await db.photo.findUniqueOrThrow({ where: { id: photo.id } });
    assert.equal(unchanged.assetId, image.id);
    assert.equal(unchanged.assetUkId, null);
    assert.equal(unchanged.isProjectCover, true);
  }));

for (const type of ['project', 'experiment']) {
  test(`Stage 3 ${type}: post-save cleanup retains default/UK assets after usage and cover removal`, () =>
    withDatabase(async (db) => {
      const save = type === 'project' ? saveProject : saveExperiment;
      const owner = (await save(db, type === 'project' ? minimal() : experimentInput()))[type];
      const folder = type === 'project' ? 'projects' : 'experiments';
      const image = await upload(db, owner, folder);
      const uk = await upload(db, owner, folder);
      const video = await upload(db, owner, folder, 'video/webm');
      await save(
        db,
        {
          coverAssetId: image.id,
          coverAssetUkId: uk.id,
          contentBlocks: [{ photos: [{ assetId: image.id, assetUkId: uk.id }] }],
          additionalMedia: [{ assetId: video.id }],
        },
        owner.id
      );
      const deleted = [];
      const { cleanupMediaAssets } = loadTypeScript('src/lib/media/delete-media-asset.ts', {
        '@/lib/prisma': { prisma: db },
        '@/lib/imagekit/client': {
          getImageKit: () => ({
            files: {
              get: async () => ({ filePath: '/safe/test' }),
              delete: async (id) => deleted.push(id),
            },
          }),
        },
        '@/lib/imagekit/assertSafeImageKitPath': { assertSafeImageKitPath() {} },
      });
      const removal = await save(db, { contentBlocks: [], additionalMedia: [] }, owner.id);
      assert.equal(removal[type].photos.length, 0);
      assert.equal(await db.mediaAsset.count(), 3);
      const cleanup = await cleanupMediaAssets(removal.cleanupCandidateAssetIds);
      assert.deepEqual([...cleanup.failedAssetIds], []);
      assert.deepEqual(deleted, []);
      assert.equal(await db.mediaAsset.count(), 3);
      const covers = await save(db, { coverAssetId: null, coverAssetUkId: null }, owner.id);
      await cleanupMediaAssets(covers.cleanupCandidateAssetIds);
      assert.deepEqual(deleted, []);
      assert.equal(await db.mediaAsset.count(), 3);
    }));
}

test('Stage 3: full draft saves preserve an unchanged legacy cover with unknown MIME', () =>
  withDatabase(async (db) => {
    const { project: owner } = await saveProject(db, minimal());
    const image = await upload(db, owner);
    await db.mediaAsset.update({ where: { id: image.id }, data: { mimeType: null } });
    const photo = await db.photo.create({
      data: { projectId: owner.id, assetId: image.id, isProjectCover: true },
    });
    const saved = await saveProject(
      db,
      {
        additionalMedia: [
          { id: photo.id, assetId: image.id, assetUkId: null, captionEn: 'Preserved' },
        ],
      },
      owner.id
    );
    assert.equal(saved.project.photos[0].captionEn, 'Preserved');
    assert.equal(saved.project.photos[0].isProjectCover, true);
    assert.equal(saved.project.photos[0].asset.mimeType, null);
  }));

for (const type of ['project', 'experiment']) {
  test(`Stage 4 ${type}: full form blocks, independent covers, publication and stable repeat saves`, () =>
    withDatabase(async (db) => {
      const save = type === 'project' ? saveProject : saveExperiment;
      const { ownerMediaInput, reconcileOwnerMedia, newContentBlock, moveContentBlock } =
        loadTypeScript('src/lib/media/owner-media-draft.ts');
      const { newMediaDraft } = loadTypeScript('src/lib/media/media-draft.ts');
      const legacy = {
        titleEn: 'Legacy',
        titleUk: 'Стара секція',
        bodyEn: 'Keep',
        bodyUk: 'Зберегти',
      };
      const original = (
        await save(db, {
          ...(type === 'project'
            ? {
                ...minimal(),
                status: 'ARCHIVED',
                sections: [legacy],
                featuresEn: ['Feature'],
                featuresUk: ['Можливість'],
              }
            : experimentInput()),
          published: true,
        })
      )[type];
      const folder = type === 'project' ? 'projects' : 'experiments';
      const image = await upload(db, original, folder);
      const uk = await upload(db, original, folder);
      const additional = await upload(db, original, folder, 'video/webm');
      const preview = (asset) => ({
        id: asset.id,
        imageUrl: asset.src,
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
      });
      const text = {
        ...newContentBlock('text'),
        titleEn: 'Title',
        titleUk: 'Заголовок',
        bodyEn: 'One paragraph.\n\nAnother paragraph.',
        bodyUk: 'Перший абзац.\n\nДругий абзац.',
      };
      const media = {
        ...newContentBlock('media'),
        photos: [
          {
            ...newMediaDraft(preview(image), 'block-photo'),
            assetUk: preview(uk),
            captionEn: 'Caption',
            descriptionUk: 'Опис',
          },
        ],
      };
      let draft = {
        coverAsset: preview(image),
        coverAssetUk: preview(uk),
        contentBlocks: [text, media],
        additionalMedia: [newMediaDraft(preview(additional), 'additional')],
      };
      let saved = (
        await save(db, { ...ownerMediaInput(draft), detailPageStatus: 'DRAFT' }, original.id)
      )[type];
      assert.equal(saved.detailPageStatus, 'DRAFT');
      assert.equal(saved.published, true);
      assert.equal(saved.contentBlocks[0].bodyEn, text.bodyEn);
      assert.equal(saved.contentBlocks[0].photos.length, 0);
      assert.equal(saved.contentBlocks[1].titleEn, null);
      assert.equal(saved.contentBlocks[1].photos[0].assetId, saved.coverAssetId);
      assert.equal(saved.contentBlocks[1].photos[0].assetUkId, saved.coverAssetUkId);
      assert.equal(saved.photos.filter((photo) => !photo.contentBlockId).length, 1);
      if (type === 'project') {
        assert.equal(saved.status, 'ARCHIVED');
        assert.equal(saved.sections[0].id, original.sections[0].id);
        assert.deepEqual(saved.featuresEn, ['Feature']);
      }
      draft = reconcileOwnerMedia(draft, draft, saved);
      const photoId = draft.contentBlocks[1].photos[0].id;
      const textId = draft.contentBlocks[0].id;
      const mediaId = draft.contentBlocks[1].id;
      const additionalId = draft.additionalMedia[0].id;
      draft.contentBlocks = moveContentBlock(draft.contentBlocks, 'media', -1);
      draft.contentBlocks[1].titleEn = 'Edited title';
      draft.contentBlocks[1].bodyUk = 'Оновлений текст.\n\nЩе абзац.';
      saved = (
        await save(db, { ...ownerMediaInput(draft), detailPageStatus: 'PUBLISHED' }, original.id)
      )[type];
      assert.equal(saved.detailPageStatus, 'PUBLISHED');
      assert.deepEqual(
        saved.contentBlocks.map((block) => block.id),
        [mediaId, textId]
      );
      assert.deepEqual(
        saved.contentBlocks.map((block) => block.order),
        [1, 2]
      );
      assert.equal(saved.contentBlocks[0].photos[0].id, photoId);
      assert.equal(saved.contentBlocks[1].bodyUk, draft.contentBlocks[1].bodyUk);
      const again = (await save(db, ownerMediaInput(draft), original.id))[type];
      assert.equal(again.contentBlocks[0].photos[0].id, photoId);
      assert.equal(await db.contentBlock.count(), 2);
      assert.equal(await db.photo.count(), 2);
      // Removing block media must neither move it into Additional Media nor remove the cover.
      const removal = await save(db, { contentBlocks: [{ id: textId }] }, original.id);
      assert.equal(removal[type].coverAssetId, image.id);
      assert.equal(removal[type].coverAssetUkId, uk.id);
      assert.deepEqual(
        removal[type].photos.map((photo) => photo.id),
        [additionalId]
      );
      assert.equal(await db.mediaAsset.count({ where: unusedMediaAssetWhere(image.id) }), 0);
      const replacement = await upload(db, original, folder);
      const replaced = await save(
        db,
        { coverAssetId: replacement.id, coverAssetUkId: null, detailPageStatus: 'NONE' },
        original.id
      );
      assert.equal(replaced[type].coverAssetId, replacement.id);
      assert.equal(replaced[type].coverAssetUkId, null);
      assert.equal(replaced[type].detailPageStatus, 'NONE');
      const removed = await save(db, { coverAssetId: null, coverAssetUkId: null }, original.id);
      assert.equal(removed[type].coverAssetId, null);
      assert.equal(removed[type].contentBlocks[0].id, textId);
      assert.equal(removed[type].photos[0].id, additionalId);
    }));
}

test('Stage 4: rejects invalid publication values and rolls publication back with invalid covers', () =>
  withDatabase(async (db) => {
    for (const type of ['project', 'experiment']) {
      const save = type === 'project' ? saveProject : saveExperiment;
      const owner = (await save(db, type === 'project' ? minimal() : experimentInput()))[type];
      const video = await upload(
        db,
        owner,
        type === 'project' ? 'projects' : 'experiments',
        'video/webm'
      );
      await assert.rejects(save(db, { detailPageStatus: 'INVALID' }, owner.id), ContentSaveError);
      await assert.rejects(
        save(db, { detailPageStatus: 'DRAFT', coverAssetId: video.id }, owner.id),
        ContentSaveError
      );
      const unchanged = (await save(db, {}, owner.id))[type];
      assert.equal(unchanged.detailPageStatus, 'NONE');
    }
  }));

test('Stage 4: new owners can save text blocks in their first main form transaction', () =>
  withDatabase(async (db) => {
    for (const type of ['project', 'experiment']) {
      const save = type === 'project' ? saveProject : saveExperiment;
      const first = (
        await save(db, {
          ...(type === 'project' ? minimal() : experimentInput()),
          detailPageStatus: 'DRAFT',
          contentBlocks: [{ bodyEn: 'First paragraph.\n\nSecond paragraph.' }],
        })
      )[type];
      assert.equal(first.contentBlocks.length, 1);
      assert.equal(first.contentBlocks[0].titleEn, null);
      assert.equal(first.contentBlocks[0].bodyEn, 'First paragraph.\n\nSecond paragraph.');
      assert.equal(first.photos.length, 0);
      assert.equal(first.detailPageStatus, 'DRAFT');
      const block = first.contentBlocks[0];
      const again = (
        await save(db, { contentBlocks: [{ id: block.id, bodyUk: 'Текст' }] }, first.id)
      )[type];
      assert.equal(again.contentBlocks[0].id, block.id);
      assert.equal(again.contentBlocks[0].bodyEn, block.bodyEn);
    }
  }));
