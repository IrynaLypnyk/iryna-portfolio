# CMS v2 compatibility review

## Local read-only report

Run from the repository root:

```sh
node scripts/cms-v2-legacy-preflight.mjs > /tmp/cms-v2-preflight.json
```

The command reads only `DATABASE_URL` from `.env.local`, refuses remote addresses, and requires `portfolio_case_study_v2` by default. An optional positional argument names a different explicitly configured **local restored database**. It does not read inherited credentials or `.env`, access ImageKit, change statuses, apply migrations, or reconcile records. Errors do not print credentials. Treat the JSON report as private content.

Database reads run in a repeatable-read, read-only transaction ending with ROLLBACK. `to_jsonb` allows analysis before and after the foundation migration (the supported legacy baseline is the schema on main, including Experiment Photo ownership). The report includes counts; per-owner Features, sections and block IDs; route eligibility; explicit/default/UK cover references; unknown/invalid asset metadata; missing references; and legacy-vs-v2 Photo membership differences. The Project legacy detail page displayed the first three mapped Photos; legacy overview mapping included all Photos. Experiment mapping excluded its selected cover.

`legacyEligible` means the legacy server's publication predicate would permit the URL. It does not establish that a URL was linked, used, indexed or served by the deployed production commit. Verify actual URLs separately. `migrationWouldSetStatus` reports the existing migration, not a recommendation or write. Current post-cutover rows cannot reconstruct historical edits/deletions: run against a pre-cutover backup for accurate historical evidence.

No implicit cover or unknown MIME is approved automatically. Retrieve authoritative metadata by ImageKit file ID during a separately approved investigation. Review cover selection and Additional Media membership independently. Do not remove legacy usages merely to pass migration checks. Confirm production migration history and approve any reconciliation separately.

## Features compatibility

Project detail pages now reuse ProjectFeatures and MetaList, including their existing rules, labels and list styling. The selected locale's Features title is used, with the existing translated default label. Empty/whitespace-only entries are omitted from rendering only. No stored arrays, ContentBlocks, publication statuses, routes or overview behaviour are changed.

## Direct PostgreSQL connection investigation — 2026-10-18

Provider documentation confirms separate pooled and direct TCP endpoints:

- Pooled: `pooled.db.prisma.io:5432`, transactional PgBouncer; unsuitable for session-level advisory locks spanning transactions.
- Direct: `db.prisma.io:5432`, TLS (`sslmode=require`); documented for session-dependent operations and migrations. Obtain the exact endpoint from the provider, not by rewriting an existing credential URL.
- Current documented concurrent direct limits: Free 10, Starter 10, Pro 50, Business 100. Five direct connections are reserved for platform operations, leaving at most 5/5/45/95 for workload connections before other tools/workers consume capacity.

Sources:

- https://www.prisma.io/docs/postgres/database/connection-pooling
- https://www.prisma.io/docs/postgres/database/connecting-to-your-database
- https://www.prisma.io/docs/guides/postgres/vercel

These are provider-level findings, NOT verification of this production account's plan, credentials, grants, endpoint or available capacity. No production/Preview connections, secrets or settings were accessed. Local `portfolio_case_study_v2` cannot establish production compatibility.

The former media lock pool used DATABASE_URL with max=2 per warm runtime instance. This is not a global cap: N warm instances may use 2\*N direct slots if switched unchanged. Migrations, Studio and other clients also consume slots. Moving all Prisma application traffic to the direct endpoint is not recommended.

Before approving a dedicated lock connection:

1. Confirm the real database plan, direct endpoint, same database identity and TLS configuration through the provider console without exposing credentials in logs.
2. Establish headroom and an aggregate concurrency budget for Vercel instances plus maintenance clients; pool max=1 alone does not cap global use.
3. In an authorised isolated environment with the same provider topology, use two separate direct pg connections: acquire a unique session advisory lock on A, prove B's pg_try_advisory_lock fails, verify A keeps the same backend/session across statements, unlock on A, prove B can acquire, then release/close both. Test disconnect release and timeout paths. Never use a real ImageKit file's lock key for this probe.
4. Rehearse registration/cleanup races using disposable isolated ImageKit assets and test safe behaviour on lock loss/unavailability.
5. Approve the connection/code change only after those results. Without a compatible direct endpoint, revisit transaction boundaries rather than simply substituting pg_advisory_xact_lock.

The session-lock implementation has since been removed; see the retention policy below. A direct lock connection is no longer required for deployment.

## Deployment media retention policy

Automatic physical deletion is disabled. Removing Photos, blocks, owners or covers
still saves through the existing transactional service, but cleanup retains both
MediaAsset records and ImageKit files. Responses expose deduplicated
`deferredAssetIds`; empty `deletedAssetIds` and `failedAssetIds` do not mean files
were deleted. Candidates can still be referenced and are not a deletion allowlist.

Upload registration still verifies ImageKit metadata and owner folder, then upserts
by unique `imageKitFileId`. Failed registration returns an error without compensating
remote deletion: the uploaded file remains available for retry (and may not have a
MediaAsset row yet). Reuse and restrictive Photo/cover foreign keys are unchanged.
No session-level advisory lock or dedicated database connection is used.

Unused files and asset records will accumulate. Physical cleanup must be a separately
approved maintenance operation with all writers paused, including Preview, and fresh
checks of default/UK Photo and Project/Experiment cover references. Do not re-enable
check-then-delete during concurrent registration. Manual deletion in ImageKit is
outside this protection. No cleanup job is introduced by this change.
