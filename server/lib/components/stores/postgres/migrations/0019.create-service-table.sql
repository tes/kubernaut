START TRANSACTION;

CREATE TABLE service (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  registry UUID NOT NULL REFERENCES registry,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT service__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX service__name__registry__uniq ON service (
  name DESC, registry DESC
) WHERE deleted_on IS NULL;

CREATE INDEX service__created_on__idx ON service (
  created_on DESC
);

CREATE FUNCTION ensure_service (
  name TEXT,
  registry UUID,
  created_on TIMESTAMP WITH TIME ZONE,
  created_by UUID
) RETURNS UUID AS
$$
DECLARE
  id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(current_schema() || '_service_' || registry || '_' || name));

  SELECT service.id INTO id
  FROM service
  WHERE service.name = ensure_service.name
    AND service.registry = ensure_service.registry;
  IF NOT FOUND THEN
    INSERT INTO service (
      id,
      name,
      registry,
      created_on,
      created_by
    ) values (
      uuid_generate_v4(),
      name,
      registry,
      created_on,
      created_by
    ) RETURNING service.id INTO id;
  END IF;

  RETURN id;
END;
$$
LANGUAGE 'plpgsql';

COMMIT;
