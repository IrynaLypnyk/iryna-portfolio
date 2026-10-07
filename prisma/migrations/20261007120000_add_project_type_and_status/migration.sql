-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('PERSONAL', 'TEAM');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('LIVE', 'IN_DEVELOPMENT', 'COMPLETED', 'ARCHIVED');

-- Defaults backfill existing projects without removing legacy status text.
ALTER TABLE "Project"
ADD COLUMN "type" "ProjectType" NOT NULL DEFAULT 'PERSONAL',
ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'COMPLETED';
