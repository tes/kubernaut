START TRANSACTION;

CREATE TABLE account_role_registry (
  id UUID PRIMARY KEY,
  account UUID NOT NULL REFERENCES account ON DELETE CASCADE,
  role UUID NOT NULL REFERENCES role ON DELETE CASCADE,
  subject UUID REFERENCES registry ON DELETE CASCADE,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT account_role_registry__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX account_role_registry__account__role__subject__uniq ON account_role_registry (
  account DESC, role DESC, subject DESC
) WHERE deleted_on IS NULL;

CREATE INDEX account_role_registry__account__idx ON account_role_registry (
  account DESC
);

CREATE INDEX account_role_registry__role__idx ON account_role_registry (
  role DESC
);

CREATE INDEX account_role_registry__subject__idx ON account_role_registry (
  subject DESC
);

CREATE FUNCTION ensure_account_role_on_registry (
  account UUID,
  role UUID,
  subject UUID,
  created_on TIMESTAMP WITH TIME ZONE,
  created_by UUID
) RETURNS text AS
$$
DECLARE
  id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(current_schema() || '_account_role_registry_' || account || '_' || role || '_' || subject));

  SELECT account_role_registry.id INTO id
  FROM account_role_registry
  WHERE account_role_registry.account = ensure_account_role_on_registry.account
    AND account_role_registry.role = ensure_account_role_on_registry.role
    AND account_role_registry.subject = ensure_account_role_on_registry.subject;
  IF NOT FOUND THEN
    INSERT INTO account_role_registry (
      id,
      account,
      role,
      subject,
      created_on,
      created_by
    ) values (
      uuid_generate_v4(),
      account,
      role,
      subject,
      created_on,
      created_by
    ) RETURNING account_role_registry.id INTO id;
  END IF;

  RETURN id;
END;
$$
LANGUAGE 'plpgsql';

COMMIT;
