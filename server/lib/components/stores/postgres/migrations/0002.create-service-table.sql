START TRANSACTION;

CREATE TABLE service (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT,
  CONSTRAINT service__name__uniq UNIQUE (name),
  CONSTRAINT service__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE FUNCTION ensure_service (
  name TEXT,
  created_on TIMESTAMP WITH TIME ZONE,
  created_by TEXT
) RETURNS text AS
$$
DECLARE
  id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(name));

  SELECT service.id INTO id FROM service WHERE service.name = ensure_service.name;
  IF NOT FOUND THEN
    INSERT INTO service (
      id,
      name,
      created_on,
      created_by
    ) values (
      uuid_generate_v4(),
      name,
      created_on,
      created_by
    ) RETURNING service.id INTO id;
  END IF;

  RETURN id;
END;
$$
LANGUAGE 'plpgsql';

COMMIT;
