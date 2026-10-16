import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import dotenv from 'dotenv';
import pg from 'pg';

// These integration tests run only in disposable schemas inside transactions
// on the explicitly authorised local database. Every test ends with ROLLBACK.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const connectionString = dotenv.parse(readFileSync(path.join(root, '.env.local'))).DATABASE_URL;
const target = new URL(connectionString);
assert.equal(target.pathname, '/portfolio_case_study_v2');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(target.hostname));
assert.ok(['postgresql:', 'postgres:'].includes(target.protocol));
assert.ok([...target.searchParams.keys()].every((key) => key === 'schema'));

const migrationName = '20261016150000_add_cms_v2_foundation';
const migrationsPath = path.join(root, 'prisma/migrations');
// Removing only transaction-boundary lines lets the actual migration SQL run
// under the test's outer transaction. PL/pgSQL BEGIN has no semicolon.
const withoutTransaction = (sql) => sql.replace(/^\s*(?:BEGIN|COMMIT);\s*$/gm, '');
const migration = withoutTransaction(
  readFileSync(path.join(migrationsPath, migrationName, 'migration.sql'), 'utf8')
);
const baseline = readdirSync(migrationsPath)
  .filter((name) => name < migrationName && /^\d/.test(name))
  .sort()
  .map((name) =>
    withoutTransaction(readFileSync(path.join(migrationsPath, name, 'migration.sql'), 'utf8'))
  );
assert.equal(baseline.length, 10);

async function withBaseline(run) {
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const identity = (
      await client.query('SELECT current_database() AS db, host(inet_server_addr()) AS address')
    ).rows[0];
    assert.equal(identity.db, 'portfolio_case_study_v2');
    assert.ok(['127.0.0.1', '::1'].includes(identity.address));
    await client.query('BEGIN');
    const schema = `cms_v2_stage1_test_${randomUUID().replaceAll('-', '')}`;
    await client.query(`CREATE SCHEMA "${schema}"`);
    await client.query(`SET LOCAL search_path TO "${schema}", pg_catalog`);
    for (const sql of baseline) await client.query(sql);
    await run(client);
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    await client.end();
  }
}

async function project(client, id = 'project', published = true) {
  await client.query(
    `INSERT INTO "Project" (id, slug, "shortLabel", "titleEn", "titleUk",
      "subtitleEn", "subtitleUk", "contextEn", "contextUk", "leadEn", "leadUk",
      "roleEn", "roleUk", published, "updatedAt")
     VALUES ($1, $1, 'Label', 'Title', 'Назва', 'Subtitle', 'Підзаголовок',
      'Context', 'Контекст', 'Lead', 'Лід', 'Role', 'Роль', $2, '2026-10-01')`,
    [id, published]
  );
}

async function experiment(client, id = 'experiment', published = true) {
  await client.query(
    `INSERT INTO "Experiment" (id, slug, "titleEn", "titleUk", "descriptionEn",
      "descriptionUk", published, "updatedAt")
     VALUES ($1, $1, 'Title', 'Назва', 'Description', 'Опис', $2, '2026-10-01')`,
    [id, published]
  );
}

async function asset(client, id = 'asset', mime = 'image/png', width = 800, src = '/test/image') {
  await client.query(
    `INSERT INTO "MediaAsset" (id, "imageKitFileId", src, "mimeType", width, height, "updatedAt")
     VALUES ($1, $1, $2, $3, $4, 600, '2026-10-01')`,
    [id, src, mime, width]
  );
}

async function photo(
  client,
  {
    id = 'photo',
    projectId = 'project',
    experimentId = null,
    assetId = 'asset',
    assetUkId = null,
    cover = true,
  } = {}
) {
  await client.query(
    `INSERT INTO "Photo" (id, "projectId", "experimentId", "assetId", "assetUkId",
      "isProjectCover", "orderInProject", "captionEn", "captionUk", "descriptionEn",
      "descriptionUk", "linkUrl", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, 7, 'Caption', 'Підпис', 'Description',
      'Опис', 'https://example.com/media', '2026-10-01')`,
    [id, projectId, experimentId, assetId, assetUkId, cover]
  );
}

async function expectDatabaseError(client, sql, code, constraint) {
  await client.query('SAVEPOINT expected_error');
  await assert.rejects(client.query(sql), (error) => {
    assert.equal(error.code, code);
    if (constraint) assert.equal(error.constraint, constraint);
    return true;
  });
  await client.query('ROLLBACK TO SAVEPOINT expected_error');
  await client.query('RELEASE SAVEPOINT expected_error');
}

test('backfills explicit bilingual covers and status while preserving all legacy values', () =>
  withBaseline(async (client) => {
    await project(client);
    await project(client, 'unselected', false);
    await experiment(client, 'experiment', false);
    await asset(client);
    await asset(client, 'asset-uk', 'image/webp');
    await photo(client, { assetUkId: 'asset-uk' });
    await photo(client, {
      id: 'experiment-photo',
      projectId: null,
      experimentId: 'experiment',
      assetUkId: 'asset-uk',
    });
    await photo(client, { id: 'unselected-photo', projectId: 'unselected', cover: false });
    const tables = ['Project', 'Experiment', 'ProjectSection', 'Photo', 'MediaAsset'];
    const before = {};
    for (const table of tables)
      before[table] = (await client.query(`SELECT * FROM "${table}" ORDER BY id`)).rows;
    await client.query(migration);
    for (const table of tables) {
      const after = (await client.query(`SELECT * FROM "${table}" ORDER BY id`)).rows;
      assert.equal(after.length, before[table].length);
      for (let i = 0; i < after.length; i++) {
        for (const key of Object.keys(before[table][i]))
          assert.deepEqual(after[i][key], before[table][i][key]);
      }
    }
    const owner = (await client.query('SELECT * FROM "Project" WHERE id = \'project\'')).rows[0];
    assert.equal(owner.coverAssetId, 'asset');
    assert.equal(owner.coverAssetUkId, 'asset-uk');
    assert.equal(owner.detailPageStatus, 'PUBLISHED');
    const exp = (await client.query('SELECT * FROM "Experiment"')).rows[0];
    assert.equal(exp.coverAssetId, 'asset');
    assert.equal(exp.coverAssetUkId, 'asset-uk');
    assert.equal(exp.detailPageStatus, 'DRAFT');
    const unselected = (await client.query('SELECT * FROM "Project" WHERE id = \'unselected\''))
      .rows[0];
    assert.equal(unselected.coverAssetId, null);
    assert.equal(unselected.coverAssetUkId, null);
    assert.equal(unselected.detailPageStatus, 'DRAFT');
    assert.ok(
      (await client.query('SELECT "contentBlockId" FROM "Photo"')).rows.every(
        (row) => row.contentBlockId === null
      )
    );
  }));

test('copies sections with real paragraph breaks, stable IDs, order and timestamps', () =>
  withBaseline(async (client) => {
    await project(client);
    await client.query(`INSERT INTO "ProjectSection"
      (id, "projectId", "order", "titleEn", "titleUk", "bodyEn", "bodyUk", "body2En", "body2Uk", "createdAt", "updatedAt")
      VALUES ('section', 'project', 9, 'Heading', 'Заголовок', 'First', 'Перший', 'Second', '  ', '2026-09-01', '2026-10-01')`);
    await client.query(migration);
    const block = (await client.query('SELECT * FROM "ContentBlock"')).rows[0];
    assert.equal(block.id, 'section');
    assert.equal(block.projectId, 'project');
    assert.equal(block.experimentId, null);
    assert.equal(block.order, 9);
    assert.equal(block.titleEn, 'Heading');
    assert.equal(block.titleUk, 'Заголовок');
    assert.equal(block.bodyEn, 'First\n\nSecond');
    assert.equal(block.bodyUk, 'Перший');
    const section = (await client.query('SELECT * FROM "ProjectSection"')).rows[0];
    assert.deepEqual(block.createdAt, section.createdAt);
    assert.deepEqual(block.updatedAt, section.updatedAt);
    assert.equal(section.body2Uk, '  ');
  }));

for (const ownerType of ['Project', 'Experiment']) {
  test(`refuses multiple selected covers for ${ownerType} and rolls back migration DDL`, () =>
    withBaseline(async (client) => {
      const owner =
        ownerType === 'Project'
          ? { projectId: 'project' }
          : { projectId: null, experimentId: 'experiment' };
      if (ownerType === 'Project') await project(client);
      else await experiment(client);
      await asset(client);
      await photo(client, { ...owner, id: 'cover-one' });
      await photo(client, { ...owner, id: 'cover-two' });
      await client.query('SAVEPOINT migration_attempt');
      await assert.rejects(client.query(migration), /multiple selected Photos/);
      await client.query('ROLLBACK TO SAVEPOINT migration_attempt');
      assert.equal(
        (await client.query(`SELECT to_regclass('"ContentBlock"') AS block`)).rows[0].block,
        null
      );
      assert.equal(
        (await client.query(`SELECT count(*)::int AS count FROM "Photo" WHERE "isProjectCover"`))
          .rows[0].count,
        2
      );
    }));
}

for (const [name, mime, width, src, ukrainian] of [
  ['video default', 'video/mp4', 800, '/test/video', false],
  ['unknown MIME', null, 800, '/test/legacy-image', false],
  ['invalid dimensions', 'image/png', 0, '/test/image', false],
  ['empty path', 'image/png', 800, '', false],
  ['video Ukrainian variant', 'video/webm', 800, '/test/video', true],
  ['unknown Ukrainian MIME', null, 800, '/test/legacy-image', true],
]) {
  test(`refuses ${name} cover without changing legacy data`, () =>
    withBaseline(async (client) => {
      await project(client);
      await asset(client, 'invalid', mime, width, src);
      if (ukrainian) await asset(client);
      await photo(client, {
        assetId: ukrainian ? 'asset' : 'invalid',
        assetUkId: ukrainian ? 'invalid' : null,
      });
      await client.query('SAVEPOINT migration_attempt');
      await assert.rejects(client.query(migration), /invalid or unverified image assets/);
      await client.query('ROLLBACK TO SAVEPOINT migration_attempt');
      assert.equal(
        (await client.query('SELECT count(*)::int AS count FROM "Photo"')).rows[0].count,
        1
      );
    }));
}

test('enforces exactly one block owner and retains the original Photo ownership CHECK', () =>
  withBaseline(async (client) => {
    await project(client);
    await experiment(client);
    await asset(client);
    await client.query(migration);
    await expectDatabaseError(
      client,
      `INSERT INTO "ContentBlock" (id, "updatedAt") VALUES ('no-owner', now())`,
      '23514',
      'ContentBlock_owner_check'
    );
    await expectDatabaseError(
      client,
      `INSERT INTO "ContentBlock" (id, "projectId", "experimentId", "updatedAt") VALUES ('two-owners', 'project', 'experiment', now())`,
      '23514',
      'ContentBlock_owner_check'
    );
    await client.query(
      `INSERT INTO "ContentBlock" (id, "projectId", "updatedAt") VALUES ('project-block', 'project', now())`
    );
    await client.query(
      `INSERT INTO "ContentBlock" (id, "experimentId", "updatedAt") VALUES ('experiment-block', 'experiment', now())`
    );
    await expectDatabaseError(
      client,
      `INSERT INTO "Photo" (id, "assetId", "updatedAt") VALUES ('no-owner', 'asset', now())`,
      '23514',
      'Photo_owner_check'
    );
    await expectDatabaseError(
      client,
      `INSERT INTO "Photo" (id, "assetId", "projectId", "experimentId", "updatedAt") VALUES ('two-owners', 'asset', 'project', 'experiment', now())`,
      '23514',
      'Photo_owner_check'
    );
  }));

test('block deletion cascades usages while preserving Additional Media, covers and assets', () =>
  withBaseline(async (client) => {
    await project(client);
    await asset(client);
    await photo(client, { id: 'additional', cover: false });
    await client.query(migration);
    await client.query(`UPDATE "Project" SET "coverAssetId" = 'asset' WHERE id = 'project'`);
    await client.query(
      `INSERT INTO "ContentBlock" (id, "projectId", "updatedAt") VALUES ('block', 'project', now())`
    );
    await photo(client, { id: 'block-photo', cover: false });
    await client.query(`UPDATE "Photo" SET "contentBlockId" = 'block' WHERE id = 'block-photo'`);
    await client.query(`DELETE FROM "ContentBlock" WHERE id = 'block'`);
    assert.deepEqual((await client.query('SELECT id FROM "Photo" ORDER BY id')).rows, [
      { id: 'additional' },
    ]);
    assert.equal(
      (await client.query('SELECT "coverAssetId" FROM "Project"')).rows[0].coverAssetId,
      'asset'
    );
    assert.equal(
      (await client.query('SELECT count(*)::int AS count FROM "MediaAsset"')).rows[0].count,
      1
    );
  }));

test('all four independent cover references restrict asset deletion without Photo usages', () =>
  withBaseline(async (client) => {
    await project(client);
    await experiment(client);
    await asset(client, 'default');
    await asset(client, 'uk', 'image/webp');
    await client.query(migration);
    for (const table of ['Project', 'Experiment']) {
      await client.query(
        `UPDATE "${table}" SET "coverAssetId" = 'default', "coverAssetUkId" = 'uk'`
      );
      for (const [column, id] of [
        ['coverAssetId', 'default'],
        ['coverAssetUkId', 'uk'],
      ]) {
        await expectDatabaseError(
          client,
          `DELETE FROM "MediaAsset" WHERE id = '${id}'`,
          '23503',
          `${table}_${column}_fkey`
        );
      }
      await client.query(`UPDATE "${table}" SET "coverAssetId" = NULL, "coverAssetUkId" = NULL`);
    }
    for (const table of ['Project', 'Experiment']) {
      await expectDatabaseError(
        client,
        `UPDATE "${table}" SET "coverAssetUkId" = 'uk'`,
        '23514',
        `${table}_cover_variant_check`
      );
    }
  }));

test('new Projects need only slug and bilingual titles as user fields and keep existing defaults', () =>
  withBaseline(async (client) => {
    await client.query(migration);
    const row = (
      await client.query(`INSERT INTO "Project" (id, slug, "titleEn", "titleUk", "updatedAt")
      VALUES ('minimal', 'minimal', 'Title', 'Назва', now()) RETURNING *`)
    ).rows[0];
    for (const key of [
      'shortLabel',
      'subtitleEn',
      'subtitleUk',
      'contextEn',
      'contextUk',
      'leadEn',
      'leadUk',
      'roleEn',
      'roleUk',
    ])
      assert.equal(row[key], null);
    assert.equal(row.status, 'COMPLETED');
    assert.equal(row.order, 0);
    assert.equal(row.featured, false);
    assert.equal(row.published, true);
    assert.equal(row.detailPageStatus, 'NONE');
    assert.deepEqual(row.stack, []);
    assert.deepEqual(row.featuresEn, []);
    assert.deepEqual(row.featuresUk, []);
    await client.query(`UPDATE "Project" SET published = false WHERE id = 'minimal'`);
    assert.equal(
      (await client.query('SELECT "detailPageStatus" FROM "Project"')).rows[0].detailPageStatus,
      'NONE'
    );
  }));
