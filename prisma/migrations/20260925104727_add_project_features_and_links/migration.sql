-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionUk" TEXT,
ADD COLUMN     "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "featuresEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "featuresUk" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "storybookUrl" TEXT;
