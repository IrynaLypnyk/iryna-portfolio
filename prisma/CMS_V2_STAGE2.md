# CMS v2 Stage 2: optional fields and shared saves

Stage 2 changes application validation and persistence only. The Stage 1 schema,
all 11 migrations, ProjectSection and isProjectCover remain intact. No block
editor, cover-picker UI, public block renderer or publication cutover is added.

## Save entry points

The existing authenticated POST/PATCH Project and Experiment routes call
`saveProject` / `saveExperiment` in `src/lib/content/save.ts`. They share
`saveOwnerContent` inside one serializable Prisma transaction. No additional
media mutation endpoint or independent form workflow was introduced.

Zod schemas live in `src/lib/content/project-input.ts`, `experiment-input.ts`
and `validation.ts`; existing API validation imports remain available through
re-exports. POST validates required fields; PATCH validates only supplied fields.
Unknown ownership/relationship keys and malformed values are rejected.

Only Project slug and bilingual titles require user values. Omitted create
fields use Prisma/database defaults: COMPLETED, published true, featured false,
order zero, empty collections and detail status NONE. ProjectForm now matches
those defaults and adapts nullable database text to controlled empty inputs.

Optional text is trimmed; null, empty and whitespace-only input become null.
Omitted PATCH keys retain their stored values. Arrays and booleans are strict:
null is not an empty collection, and the string "false" is not a boolean.
Features remain bilingual string arrays with optional headings; omission keeps
them, and an explicit empty array clears that locale's list.

## Single form save contract

Both owner endpoints accept these optional fields alongside their existing
scalar fields. The owner is always derived on the server from the route/created
record; clients never provide projectId or experimentId on blocks or Photos.

```json
{
  "roleEn": null,
  "coverAssetId": "registered-default-asset-id",
  "coverAssetUkId": "registered-ukrainian-asset-id",
  "contentBlocks": [
    {
      "id": "existing-block-id",
      "titleEn": "Updated heading",
      "photos": [
        { "id": "existing-photo-id" },
        {
          "assetId": "newly-uploaded-asset-id",
          "captionEn": "Caption",
          "captionUk": "Підпис"
        }
      ]
    },
    { "bodyUk": "Перший абзац\n\nДругий абзац" }
  ],
  "additionalMedia": [{ "id": "existing-additional-photo-id" }]
}
```

| Input                        | Meaning                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------- |
| Collection omitted           | Preserve that collection.                                                         |
| `contentBlocks: []`          | Remove the owner's blocks and their Photo usages.                                 |
| Existing block `id`          | Update that block in place; omitted text/media remains.                           |
| Block without `id`           | Create a new block with a server-generated ID.                                    |
| Block `photos` omitted       | Preserve the block's media and ordering.                                          |
| Block `photos: []`           | Remove that block's Photo usages.                                                 |
| Explicit Photo list          | Keep/update/create the listed usages; remove omitted usages from that collection. |
| Existing Photo `id`          | Update in place; omitted assets and metadata remain.                              |
| Photo without `id`           | Create a usage; `assetId` is required.                                            |
| Optional metadata null/blank | Clear that metadata only.                                                         |
| `assetUkId: null`            | Remove the Ukrainian variant reference, retaining default media and metadata.     |
| Cover fields omitted         | Preserve current cover references.                                                |
| Both cover fields null       | Clear the independent cover.                                                      |

Array position defines block/media ordering, stored as 1-based order values.
Existing IDs must exist under the saved owner; unknown IDs do not become new
records. A Photo ID cannot occur in two submitted collections. Explicit moves
between collections of the same owner preserve the Photo ID. Moving a Photo out
of a removed block requires explicitly listing it in its destination; nothing
is automatically moved into Additional Media.

The response includes the saved owner, ordered blocks/media (with their IDs),
and `cleanupCandidateAssetIds`. The future editor must reconcile returned IDs
before its next save. The current legacy section editor now sends/reconciles
section IDs too, avoiding delete/recreate updates. Omitted legacy sections are
preserved; no legacy records are migrated or removed during this stage.

All scalar, cover, block, Photo and legacy-section changes roll back together
on validation/database errors. Serializable write conflicts return HTTP 409;
clients must reload/retry rather than silently overwriting concurrent content.
Authentication is checked before parsing/saving; validation errors return 400,
missing owners 404 and duplicate slugs 409.

## Ownership, assets and covers

- Blocks are created with exactly one server-selected owner. Existing block
  and Photo IDs must belong to that owner. Cross-Project and cross-Experiment
  associations, injected ownership keys and duplicate IDs are rejected.
- Stored Photos with a block owned by a different record also cause the save
  to fail. The schema's ordinary foreign keys alone do not guarantee this rule.
- A registered asset may be reused if it already belongs to the owner's Photos
  or covers, including legacy files under old slug paths. Otherwise it must be
  in the owner's current or just-renamed ImageKit upload folder and must not
  already be used exclusively by another owner. Clients cannot attach arbitrary
  foreign asset IDs. Actual ImageKit registration still uses existing server
  verification; the save service accepts registered MediaAsset IDs, not raw URLs.
- Photo captions, descriptions, links and default/Ukrainian references remain
  usage-specific. Multiple usages of one MediaAsset do not copy physical files.
- Covers are independent direct references; selecting one creates no Photo and
  changes no gallery membership. Both variants must be known supported images
  with positive dimensions and valid paths; videos/unknown MIME are rejected.
- A Ukrainian cover requires a default cover after merging PATCH values. Clearing
  a default while retaining an existing Ukrainian variant is rejected; clear
  both explicitly. Replacing only the default retains the Ukrainian selection.
- Default/UK Photo usages and all four cover relations now count in the existing
  unused-asset helper and admin media-library usage display. Foreign keys remain
  a database safeguard against deleting referenced assets.

## Deliberate cleanup limitation until Stage 3

New form-level saves remove requested Photo usages transactionally and collect
the old asset IDs. They do **not** call ImageKit or delete MediaAsset records.
The returned IDs are candidates, not assertions that files are unused. They can
still be referenced by Photos or covers. This prevents physical cleanup from
becoming a competing content save or from happening before a rollback.

Stage 3 must connect those candidates to the existing post-commit cleanup
workflow, rechecking all six reference paths and distinguishing successful
content removal from cleanup failures. This stage adds no separate cleanup
queue, status flags, picker, file-deletion endpoint or coordination system.

The legacy PhotoManager and its upload/delete endpoints continue operating.
The small cover-reference guard fixes their cover-only asset protection, but
their broader ImageKit partial-failure behaviour remains a Stage 3 task. The
existing uploader still registers a Photo immediately; register-only upload
integration for the future single form editor is also Stage 3 work.

## Public and admin compatibility

Public Project types and mappers retain nullable optional text and normalise
legacy blank strings to null. Components omit missing paragraphs, role rows,
short-label separators and unnecessary placeholder text. Missing Project lead
text does not generate a page-specific SEO description. Existing editorial
classes/layout and Features presentation are otherwise preserved.

Legacy public queries and the old admin PhotoManager loaders read only Photos
with `contentBlockId = null`. Newly saved block media therefore stays out of
legacy public galleries and the independent legacy media editor. Existing
`isProjectCover` gallery filtering is retained; no cutover membership changes
are made.

Public cover rendering still follows the legacy paths pending the reviewed
application cutover; the new direct covers are persisted by the save service.
Detail publication controls/enforcement and public block rendering remain later
work. The Stage 2 input schemas deliberately do not expose detailPageStatus
updates before those public guards exist. Reconcile legacy cover flags and the
Stage 1 section snapshot at the approved cutover; see CMS_V2_STAGE1.md.

## Files and verification

- Shared server logic: `src/lib/content/{validation,project-input,experiment-input,save,http,text}.ts`.
- Existing Project/Experiment POST/PATCH handlers and validation re-exports.
- ProjectForm, SectionsEditor, admin lists/loaders and media-library queries.
- Public Project types, Project/Experiment query filters, Project mappers,
  Project articles and Project detail/SEO null guards.
- Existing cleanup helper plus `src/lib/media/unused-media-asset.ts`.
- Real Prisma integration tests: `scripts/cms-v2-stage2.test.mjs`.
- Rendering/auth/query/cleanup guard tests: `scripts/cms-v2-stage2-public.test.mjs`.
- Test-only loaders: `scripts/helpers/{typescript-loader,load-typescript}.mjs`.
- Existing Experiment tests now match the already-optional summaries and
  existing SVG arrow; no Experiment visual behaviour changed. Removed one
  unused desktop navigation icon binding so the zero-warning lint check passes.

Integration tests verify the URL and live identity of the authorised local
`portfolio_case_study_v2` database, replay migrations in disposable schemas,
exercise the actual generated Prisma client and transaction service, and drop
those schemas in cleanup. They compare every public content/migration record
before/after to ensure the application's data is untouched. No remote database,
ImageKit API or production/Preview service is used.

Commands:

```sh
node node_modules/prisma/build/index.js --config prisma7.config.ts validate
npm run typecheck
npm run lint
node --test scripts/cms-v2-stage2-public.test.mjs scripts/experiments.test.mjs
# Verified local database only:
node --test scripts/cms-v2-stage1.test.mjs scripts/cms-v2-stage2.test.mjs
```

No schema changes, migrations, commit, push, merge or deployment are part of Stage 2.

## Final results (2026-10-16)

- Prisma validation passed; migration history remains 11 applied with matching
  checksums and no live-database/schema difference.
- `npm run typecheck` passed, including Next route type generation. All 15
  nullable-field errors from Stage 1 are resolved without narrowing the fields
  back to required strings.
- `npm run lint` passed with zero warnings.
- Combined regression suite: **59 passed, 0 failed** (14 Stage 1 migration tests,
  13 Stage 2 validation/real-Prisma tests, 9 compatibility/auth tests and 23
  existing Experiment tests).
- The local public tables still contain zero Projects, Experiments,
  ProjectSections, ContentBlocks, Photos and MediaAssets. Public data and
  migration records were compared before/after each Prisma integration test.
- `git diff --check` passed. The user's already-staged Stage 1 files were not
  restaged, committed or modified by this stage.
- A passing integration test emits a pg deprecation warning about concurrent
  client queries. A targeted stack trace points into the installed Prisma
  runtime and `@prisma/adapter-pg`; service queries are awaited sequentially.
  No dependency or adapter changes were made to suppress it.

There is no additional architecture decision blocking review. Stage 3 still
needs approval before implementing the editor/upload integration and completing
physical cleanup. Public block/detail-publication and legacy cover-membership
cutover work remains outside Stage 2. Production, Preview and ImageKit were not
contacted during implementation or verification.
