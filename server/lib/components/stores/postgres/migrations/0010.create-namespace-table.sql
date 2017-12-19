START TRANSACTION;

CREATE TABLE namespace (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT REFERENCES account,
  CONSTRAINT namespace__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX namespace__name__uniq ON namespace (
  name DESC
) WHERE deleted_on IS NULL;

CREATE INDEX namespace__created_on__idx ON namespace (
  created_on DESC
);

CREATE FUNCTION ensure_namespace (
  name TEXT,
  created_on TIMESTAMP WITH TIME ZONE,
  created_by TEXT
) RETURNS text AS
$$
DECLARE
  id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(current_schema() || '_namespace_' || name));

  SELECT namespace.id INTO id FROM namespace WHERE namespace.name = ensure_namespace.name;
  IF NOT FOUND THEN
    INSERT INTO namespace (
      id,
      name,
      created_on,
      created_by
    ) values (
      uuid_generate_v4(),
      name,
      created_on,
      created_by
    ) RETURNING namespace.id INTO id;
  END IF;

  RETURN id;
END;
$$
LANGUAGE 'plpgsql';

COMMIT;
