BEGIN;

-- Convert existing comma/middle-dot lists without dropping the column or its data.
-- Preserve technology order and discard empty entries; NULL becomes an empty array.
CREATE FUNCTION pg_temp.project_stack_array(value TEXT) RETURNS TEXT[]
LANGUAGE SQL IMMUTABLE AS $$
  SELECT ARRAY(
    SELECT btrim(item)
    FROM regexp_split_to_table(COALESCE(value, ''), '[,·]') WITH ORDINALITY AS parts(item, position)
    WHERE btrim(item) <> ''
    ORDER BY position
  );
$$;

ALTER TABLE "Project"
  ALTER COLUMN "stack" TYPE TEXT[] USING pg_temp.project_stack_array("stack"),
  ALTER COLUMN "stack" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "stack" SET NOT NULL;

DROP FUNCTION pg_temp.project_stack_array(TEXT);

COMMIT;
