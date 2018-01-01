START TRANSACTION;

CREATE TABLE release_template (
  id TEXT PRIMARY KEY,
  source_yaml TEXT NOT NULL,
  source_json JSONB NOT NULL,
  checksum TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT REFERENCES account,
  CONSTRAINT release__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX release__checksum__uniq ON release_template (
  checksum DESC
) WHERE deleted_on IS NULL;

CREATE FUNCTION ensure_release_template (
  source_yaml TEXT,
  source_json JSONB,
  checksum TEXT,
  created_on TIMESTAMP WITH TIME ZONE,
  created_by TEXT
) RETURNS text AS
$$
DECLARE
  id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(current_schema() || '_release_template_' || checksum));

  SELECT release_template.id INTO id FROM release_template WHERE release_template.checksum = ensure_release_template.checksum;
  IF NOT FOUND THEN
    INSERT INTO release_template (
      id,
      source_yaml,
      source_json,
      checksum,
      created_on,
      created_by
    ) values (
      uuid_generate_v4(),
      source_yaml,
      source_json,
      checksum,
      created_on,
      created_by
    ) RETURNING release_template.id INTO id;
  END IF;

  RETURN id;
END;
$$
LANGUAGE 'plpgsql';

COMMIT;
