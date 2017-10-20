START TRANSACTION;

CREATE TABLE release_template (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  checksum TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT,
  UNIQUE (checksum),
  CONSTRAINT release_deletion CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE INDEX release_template__checksum__idx ON release_template (
  checksum
);

CREATE INDEX release_template__deleted_on__created_on__id__idx on release_template (
  COALESCE(deleted_on, created_on), id
);

CREATE FUNCTION ensure_release_template (
  source TEXT,
  checksum TEXT,
  created_on TIMESTAMP WITH TIME ZONE,
  created_by TEXT
) RETURNS text AS
$$
DECLARE
  id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(checksum));

  SELECT release_template.id INTO id FROM release_template WHERE release_template.checksum = ensure_release_template.checksum;
  IF NOT FOUND THEN
    INSERT INTO release_template (
      id,
      source,
      checksum,
      created_on,
      created_by
    ) values (
      uuid_generate_v4(),
      source,
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
