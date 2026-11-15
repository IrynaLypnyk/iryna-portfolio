-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "detailCoverAssetId" TEXT,
ADD COLUMN     "detailCoverAssetUkId" TEXT,
ADD COLUMN     "useSameCover" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "detailCoverAssetId" TEXT,
ADD COLUMN     "detailCoverAssetUkId" TEXT,
ADD COLUMN     "useSameCover" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Project_detailCoverAssetId_idx" ON "Project"("detailCoverAssetId");

-- CreateIndex
CREATE INDEX "Project_detailCoverAssetUkId_idx" ON "Project"("detailCoverAssetUkId");

-- CreateIndex
CREATE INDEX "Experiment_detailCoverAssetId_idx" ON "Experiment"("detailCoverAssetId");

-- CreateIndex
CREATE INDEX "Experiment_detailCoverAssetUkId_idx" ON "Experiment"("detailCoverAssetUkId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_detailCoverAssetId_fkey" FOREIGN KEY ("detailCoverAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_detailCoverAssetUkId_fkey" FOREIGN KEY ("detailCoverAssetUkId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_detailCoverAssetId_fkey" FOREIGN KEY ("detailCoverAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_detailCoverAssetUkId_fkey" FOREIGN KEY ("detailCoverAssetUkId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
