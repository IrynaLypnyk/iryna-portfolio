-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleUk" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionUk" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "stack" TEXT,
    "demoUrl" TEXT,
    "githubUrl" TEXT,
    "coverAssetId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_slug_key" ON "Experiment"("slug");

-- CreateIndex
CREATE INDEX "Experiment_published_order_idx" ON "Experiment"("published", "order");

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
