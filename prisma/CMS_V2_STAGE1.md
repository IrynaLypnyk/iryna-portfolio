# CMS v2 Stage 1: additive database foundation

Stage 1 only, applied locally on 2026-10-16. No application forms, API save
handlers, public rendering, or ImageKit cleanup were changed. Stage 2 requires
review before work starts.

## Schema and migration

The complete reviewed SQL is
[`migrations/20261016150000_add_cms_v2_foundation/migration.sql`](migrations/20261016150000_add_cms_v2_foundation/migration.sql).
The ten preceding migrations are unchanged.

- `ContentBlock`: generated ID; exactly one Project/Experiment owner; `order`
  defaulting to zero; nullable `titleEn`, `titleUk`, `bodyEn`, `bodyUk`; Photo
  relation; creation/update timestamps; owner/order indexes. No layout field.
- `Photo`: nullable `contentBlockId` with an indexed cascading block relation.
  Existing owner relations, `Photo_owner_check`, `isProjectCover`, media variants,
  ordering, captions, descriptions and links remain intact.
- Both owners: optional `coverAssetId` and `coverAssetUkId`, indexed direct
  MediaAsset relations using `ON DELETE RESTRICT`; `contentBlocks`; and
  `detailPageStatus`, default `NONE`. MediaAsset has four inverse cover relations.
- `DetailPageStatus`: `NONE`, `DRAFT`, `PUBLISHED`.
- Project: `shortLabel`, `subtitleEn/Uk`, `contextEn/Uk`, `leadEn/Uk` and
  `roleEn/Uk` become nullable. Only slug and bilingual titles require user values.
  Existing status, order, collection, visibility and featured defaults remain.
- `ProjectSection` and its Project relation are unchanged.
- Database CHECKs require exactly one ContentBlock owner and a default cover
  whenever a Ukrainian cover is present. Cover foreign keys prevent deleting
  referenced assets. There is no uniqueness constraint on asset reuse.

Photo-to-block _same-owner_ consistency is intentionally a subsequent
server-side save validation requirement. The foreign keys and owner CHECKs do
not enforce that cross-table invariant. Stage 1 exposes no block-writing API.

## Backfill and failure behaviour

The migration runs in one transaction, with a five-second lock timeout and
table locks to keep the legacy snapshot stable. It performs no HTTP requests,
file deletion, Photo deletion, MediaAsset deletion or metadata normalisation.

1. Multiple selected cover Photos for either owner type abort the entire
   migration, including DDL. The error identifies the owners; no selection wins
   by order, timestamp or ID. Two selected usages of the same asset still count
   as an ambiguous selection.
2. Selected covers must have verified image MIME types (`image/jpeg`,
   `image/png`, `image/webp`, `image/gif`, `image/avif`), positive dimensions and
   nonblank paths in both variants. Null/unknown MIME, video or invalid metadata
   aborts with the Photo IDs. Historical null MIME values are left untouched;
   affected selections need explicit review before applying on another database.
3. Each unambiguous selected Photo supplies the owner's default and Ukrainian
   cover IDs. Owners without explicit selections retain null covers. This stage
   does not guess among implicit first-image fallbacks.
4. Existing visible items receive detail status `PUBLISHED`; existing hidden
   items receive `DRAFT`, preserving prior detail-route eligibility as a one-time
   copy. New items default to `NONE`. Future status changes must be independent.
5. ProjectSections are copied to ContentBlocks with the same IDs, owner, order,
   titles and timestamps. Nonblank second paragraphs are appended with two real
   newline characters independently for each locale. Originals remain intact.
6. Original Photo/MediaAsset rows and every legacy field are unchanged. No Photo
   is assigned to a block. Owner `updatedAt` timestamps are preserved by the SQL.

## Gallery and cover cutover requirements

Stage 1 leaves public queries and `isProjectCover` filtering unchanged. Merely
copying cover references does not add a gallery occurrence, hide an existing
one, or alter media ordering.

Before changing those queries in a later stage:

- Reconcile cover references against the latest legacy flags. The old editor
  still edits flags; these new references are a snapshot, not a dual-write system.
- Audit existing effective covers, including Experiment first-image fallbacks
  and the differing Project overview/detail fallbacks. Do not choose a new
  implicit cover during cutover.
- Produce an explicitly reviewed list of legacy cover-only Photo usages before
  removing the legacy flag. A flagged usage is not automatically proof of the
  editor's intent to show it in Additional Media.
- Retain ordinary gallery usages, order and metadata. A cover-only occurrence
  intended to stay out of Additional Media must be removed as a gallery usage
  in the reviewed cutover, after preserving its metadata in the cutover audit
  and resolving whether it needs to be retained as a deliberate gallery item.
  Do not blanket-delete flagged Photos or expose them by simply dropping the
  old filter. No such deletion happens in Stage 1.
- After cutover, every Photo in Additional Media is displayed. No replacement
  visibility flags, membership exclusions or automatic movement from blocks
  are introduced. Covers use only direct owner relations.
- Reconcile copied sections against the latest ProjectSections before switching
  editors: the current save handler deletes/recreates section IDs. Do not treat
  the initial copied blocks as synchronised live content.
- Update all unused-asset checks to include all four cover relations before
  enabling independent cover writes. Implement shared deletion separately;
  Stage 1 performs no ImageKit cleanup coordination.

The existing cleanup helper is not yet cover-aware. On a populated database,
removing the last Photo usage of a backfilled cover can therefore remove that
usage and then return a foreign-key cleanup error. The new restrictive cover
relations protect the file, but the API response needs the subsequent deletion
work. Stage 1 alone is not an application release, including for the old editor.

There are no legacy cover-only usages in the verified local database. No
production or Preview dataset was inspected to classify their usages.

## Local application and preservation audit

Only `portfolio_case_study_v2` at local loopback `::1:5432` was migrated
(PostgreSQL 16.15). Connection guards checked both the parsed URL and the live
database identity. Prisma migration deploy applied exactly the new migration;
no reset, db push, seed or remote deployment was used.

| Table          | Before | After |
| -------------- | -----: | ----: |
| Project        |      0 |     0 |
| Experiment     |      0 |     0 |
| ProjectSection |      0 |     0 |
| Photo          |      0 |     0 |
| MediaAsset     |      0 |     0 |
| ContentBlock   | absent |     0 |

There were no real cover assignments to backfill: both owner cover lists remain
empty. Backfill behaviour was instead verified with populated synthetic records
in isolated schemas under transactions that rolled back. No test schema remains.

The before/after audit compared every original field, record count and all
applied migration checksums. Original values and historical checksums matched.
Local recovery artifacts, outside version control:

- `/private/tmp/portfolio_case_study_v2-stage1-before.dump` (pg_dump custom archive).
- `/private/tmp/cms-v2-stage1-before.json` (baseline content snapshot).

## Validation

- Prisma format, validate and generate: passed; Client 7.10.0 regenerated locally.
- Prisma migrate status: 11 migrations applied; database up to date.
- Prisma migrate diff, live database to schema, `--exit-code`: no difference.
- `node --test scripts/cms-v2-stage1.test.mjs`: 14/14 passed. The tests replay the
  original ten migrations plus this migration in disposable schemas inside the
  authorised local database, then roll back. Tests cover data preservation,
  bilingual cover backfill, ambiguity/invalid-image rejection, section copying,
  ownership CHECKs, block cascading, all cover foreign keys and minimal Projects.
- Changed test-file ESLint and `git diff --check`: passed.
- Full lint: existing unused `Icon` warning in AdminNav fails the zero-warning
  policy; that application file is unchanged.
- Existing Experiment suite: the same 21/23 passed before and after Stage 1
  generation. Existing failures concern required short descriptions and the
  link-indicator arrow.
- TypeScript passed before client regeneration. Afterwards it reports 15
  nullable-string errors in ProjectForm, project-mappers and
  get-published-projects. These require the approved subsequent form/type/mapper
  work. No type assertions or generated-client edits mask them in Stage 1.

The database migration is backward-compatible with existing data and retained
legacy structures. The application is not ready for a checked build/deployment
with the regenerated nullable types until the subsequent application stage.
No commit, push, merge, production/Preview mutation or deployment was performed.
