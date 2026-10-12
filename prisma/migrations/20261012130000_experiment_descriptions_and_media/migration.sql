BEGIN;
ALTER TABLE "Experiment"
ADD COLUMN "shortDescriptionUk" TEXT NOT NULL DEFAULT '',
ADD COLUMN "shortDescriptionEn" TEXT NOT NULL DEFAULT '';
-- Keep existing cards populated until their summaries are edited.
UPDATE "Experiment" SET "shortDescriptionUk" = "descriptionUk", "shortDescriptionEn" = "descriptionEn";
ALTER TABLE "Photo" ALTER COLUMN "projectId" DROP NOT NULL;
ALTER TABLE "Photo" ADD COLUMN "experimentId" TEXT;
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_owner_check" CHECK (("projectId" IS NOT NULL) <> ("experimentId" IS NOT NULL));
CREATE INDEX "Photo_experimentId_orderInProject_idx" ON "Photo"("experimentId", "orderInProject");
-- Move existing covers into the shared gallery without replacing their assets.
INSERT INTO "Photo" ("id", "assetId", "experimentId", "orderInProject", "isProjectCover", "createdAt", "updatedAt")
SELECT 'experiment-cover-' || "id", "coverAssetId", "id", 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Experiment" WHERE "coverAssetId" IS NOT NULL;
ALTER TABLE "Experiment" DROP COLUMN "coverAssetId";
COMMIT;
