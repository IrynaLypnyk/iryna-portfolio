-- CMS v2 foundation only. Legacy readers/writers keep ProjectSection and
-- isProjectCover; no Photo/MediaAsset row or ImageKit file is removed.
BEGIN;
SET LOCAL lock_timeout = '5s';

-- Keep the cover/section snapshot stable throughout this additive migration.
LOCK TABLE "Project", "Experiment", "Photo", "MediaAsset", "ProjectSection"
    IN SHARE ROW EXCLUSIVE MODE;

-- CreateEnum
CREATE TYPE "DetailPageStatus" AS ENUM ('NONE', 'DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "coverAssetId" TEXT,
ADD COLUMN     "coverAssetUkId" TEXT,
ADD COLUMN     "detailPageStatus" "DetailPageStatus" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "contentBlockId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "coverAssetId" TEXT,
ADD COLUMN     "coverAssetUkId" TEXT,
ADD COLUMN     "detailPageStatus" "DetailPageStatus" NOT NULL DEFAULT 'NONE',
ALTER COLUMN "shortLabel" DROP NOT NULL,
ALTER COLUMN "subtitleUk" DROP NOT NULL,
ALTER COLUMN "subtitleEn" DROP NOT NULL,
ALTER COLUMN "contextUk" DROP NOT NULL,
ALTER COLUMN "contextEn" DROP NOT NULL,
ALTER COLUMN "leadUk" DROP NOT NULL,
ALTER COLUMN "leadEn" DROP NOT NULL,
ALTER COLUMN "roleUk" DROP NOT NULL,
ALTER COLUMN "roleEn" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "experimentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "titleEn" TEXT,
    "titleUk" TEXT,
    "bodyEn" TEXT,
    "bodyUk" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentBlock_projectId_order_idx" ON "ContentBlock"("projectId", "order");

-- CreateIndex
CREATE INDEX "ContentBlock_experimentId_order_idx" ON "ContentBlock"("experimentId", "order");

-- CreateIndex
CREATE INDEX "Experiment_coverAssetId_idx" ON "Experiment"("coverAssetId");

-- CreateIndex
CREATE INDEX "Experiment_coverAssetUkId_idx" ON "Experiment"("coverAssetUkId");

-- CreateIndex
CREATE INDEX "Photo_contentBlockId_orderInProject_idx" ON "Photo"("contentBlockId", "orderInProject");

-- CreateIndex
CREATE INDEX "Project_coverAssetId_idx" ON "Project"("coverAssetId");

-- CreateIndex
CREATE INDEX "Project_coverAssetUkId_idx" ON "Project"("coverAssetUkId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_coverAssetUkId_fkey" FOREIGN KEY ("coverAssetUkId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_coverAssetUkId_fkey" FOREIGN KEY ("coverAssetUkId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "ContentBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prisma cannot express this exactly-one-owner CHECK.
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_owner_check"
    CHECK (("projectId" IS NOT NULL) <> ("experimentId" IS NOT NULL));

ALTER TABLE "Project" ADD CONSTRAINT "Project_cover_variant_check"
    CHECK ("coverAssetUkId" IS NULL OR "coverAssetId" IS NOT NULL);
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_cover_variant_check"
    CHECK ("coverAssetUkId" IS NULL OR "coverAssetId" IS NOT NULL);

-- Never resolve ambiguous selections or guess whether an unknown MIME is an image.
-- Abort the entire transaction, including DDL, and report the affected usages.
DO $$
DECLARE
    conflicting_owners TEXT;
    invalid_photos TEXT;
BEGIN
    SELECT string_agg(owner, ', ' ORDER BY owner) INTO conflicting_owners
    FROM (
        SELECT CASE WHEN "projectId" IS NOT NULL
                    THEN 'Project:' || "projectId"
                    ELSE 'Experiment:' || "experimentId" END AS owner
        FROM "Photo"
        WHERE "isProjectCover" = true
        GROUP BY "projectId", "experimentId"
        HAVING count(*) > 1
    ) conflicts;

    IF conflicting_owners IS NOT NULL THEN
        RAISE EXCEPTION 'CMS v2 cover backfill refused: multiple selected Photos for %', conflicting_owners
            USING HINT = 'Review legacy isProjectCover selections explicitly before retrying; no candidate was chosen.';
    END IF;

    SELECT string_agg(p.id, ', ' ORDER BY p.id) INTO invalid_photos
    FROM "Photo" p
    LEFT JOIN "MediaAsset" a ON a.id = p."assetId"
    LEFT JOIN "MediaAsset" uk ON uk.id = p."assetUkId"
    WHERE p."isProjectCover" = true AND (
        a.id IS NULL OR a."mimeType" IS NULL
        OR a."mimeType" NOT IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif')
        OR a.width <= 0 OR a.height <= 0 OR btrim(a.src) = ''
        OR (p."assetUkId" IS NOT NULL AND (
            uk.id IS NULL OR uk."mimeType" IS NULL
            OR uk."mimeType" NOT IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif')
            OR uk.width <= 0 OR uk.height <= 0 OR btrim(uk.src) = ''
        ))
    );

    IF invalid_photos IS NOT NULL THEN
        RAISE EXCEPTION 'CMS v2 cover backfill refused: invalid or unverified image assets on Photos %', invalid_photos
            USING HINT = 'Review the default and Ukrainian MIME types, dimensions and paths; no assets were changed.';
    END IF;
END $$;

-- Copy only explicit, unique, validated cover selections. Owners without an
-- explicit selection stay NULL; implicit first-image fallbacks need cutover review.
UPDATE "Project" owner
SET "coverAssetId" = photo."assetId", "coverAssetUkId" = photo."assetUkId"
FROM "Photo" photo
WHERE photo."projectId" = owner.id AND photo."isProjectCover" = true;

UPDATE "Experiment" owner
SET "coverAssetId" = photo."assetId", "coverAssetUkId" = photo."assetUkId"
FROM "Photo" photo
WHERE photo."experimentId" = owner.id AND photo."isProjectCover" = true;

-- Preserve existing detail-route eligibility as a one-time compatibility copy.
-- Future status changes must be independent; new records default to NONE.
UPDATE "Project"
SET "detailPageStatus" = CASE WHEN published THEN 'PUBLISHED'::"DetailPageStatus"
                             ELSE 'DRAFT'::"DetailPageStatus" END;
UPDATE "Experiment"
SET "detailPageStatus" = CASE WHEN published THEN 'PUBLISHED'::"DetailPageStatus"
                             ELSE 'DRAFT'::"DetailPageStatus" END;

-- Preserve original sections, IDs, order, locale text and timestamps. Empty
-- optional second paragraphs add no separator. This is a snapshot, not dual-write.
-- Reconcile any subsequent legacy section edits at the application cutover.
INSERT INTO "ContentBlock" (
    id, "projectId", "order", "titleEn", "titleUk", "bodyEn", "bodyUk", "createdAt", "updatedAt"
)
SELECT id, "projectId", "order", "titleEn", "titleUk",
       "bodyEn" || CASE WHEN "body2En" IS NOT NULL AND btrim("body2En") <> ''
                       THEN E'\n\n' || "body2En" ELSE '' END,
       "bodyUk" || CASE WHEN "body2Uk" IS NOT NULL AND btrim("body2Uk") <> ''
                       THEN E'\n\n' || "body2Uk" ELSE '' END,
       "createdAt", "updatedAt"
FROM "ProjectSection";

-- Existing Photo membership, order, metadata, isProjectCover and assets are
-- intentionally untouched. Do not change gallery filtering in this stage.
COMMIT;

