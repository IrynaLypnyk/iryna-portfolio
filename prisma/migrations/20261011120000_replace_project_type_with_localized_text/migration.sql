BEGIN;

ALTER TABLE "Project" ADD COLUMN "projectTypeEn" TEXT, ADD COLUMN "projectTypeUk" TEXT;

UPDATE "Project" SET
  "projectTypeEn" = CASE "type"::text
    WHEN 'SOLO_DEVELOPED' THEN 'Solo-developed project'
    WHEN 'TEAM' THEN 'Team project'
    WHEN 'PERSONAL' THEN 'Personal project'
  END,
  "projectTypeUk" = CASE "type"::text
    WHEN 'SOLO_DEVELOPED' THEN 'Самостійно розроблений проєкт'
    WHEN 'TEAM' THEN 'Командний проєкт'
    WHEN 'PERSONAL' THEN 'Особистий проєкт'
  END;

ALTER TABLE "Project" DROP COLUMN "type";
DROP TYPE "ProjectType";

COMMIT;
