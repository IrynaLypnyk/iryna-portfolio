-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "googleId" TEXT,
    "image" TEXT,
    "name" TEXT,
    "password" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortLabel" TEXT NOT NULL,
    "titleUk" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "subtitleUk" TEXT NOT NULL,
    "subtitleEn" TEXT NOT NULL,
    "contextUk" TEXT NOT NULL,
    "contextEn" TEXT NOT NULL,
    "leadUk" TEXT NOT NULL,
    "leadEn" TEXT NOT NULL,
    "roleUk" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL,
    "stack" TEXT,
    "statusUk" TEXT,
    "statusEn" TEXT,
    "yearLabel" TEXT,
    "externalUrl" TEXT,
    "linkLabelUk" TEXT,
    "linkLabelEn" TEXT,
    "linkNoteUk" TEXT,
    "linkNoteEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSection" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "titleUk" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bodyUk" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "body2Uk" TEXT,
    "body2En" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "imageKitFileId" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "assetUkId" TEXT,
    "projectId" TEXT NOT NULL,
    "orderInProject" INTEGER NOT NULL DEFAULT 0,
    "isProjectCover" BOOLEAN NOT NULL DEFAULT false,
    "captionUk" TEXT,
    "captionEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_googleId_key" ON "Admin"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_featured_order_idx" ON "Project"("featured", "order");

-- CreateIndex
CREATE INDEX "Project_published_idx" ON "Project"("published");

-- CreateIndex
CREATE INDEX "ProjectSection_projectId_order_idx" ON "ProjectSection"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_imageKitFileId_key" ON "MediaAsset"("imageKitFileId");

-- CreateIndex
CREATE INDEX "Photo_assetId_idx" ON "Photo"("assetId");

-- CreateIndex
CREATE INDEX "Photo_assetUkId_idx" ON "Photo"("assetUkId");

-- CreateIndex
CREATE INDEX "Photo_projectId_orderInProject_idx" ON "Photo"("projectId", "orderInProject");

-- AddForeignKey
ALTER TABLE "ProjectSection" ADD CONSTRAINT "ProjectSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_assetUkId_fkey" FOREIGN KEY ("assetUkId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
