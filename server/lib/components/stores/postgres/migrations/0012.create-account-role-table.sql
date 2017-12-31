START TRANSACTION;

CREATE TABLE account_role (
  id TEXT PRIMARY KEY,
  account TEXT NOT NULL REFERENCES account ON DELETE CASCADE,
  role TEXT NOT NULL REFERENCES role ON DELETE CASCADE,
  namespace TEXT REFERENCES namespace ON DELETE CASCADE,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT REFERENCES account,
  CONSTRAINT account_role__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX account_role__account__role__namespace__uniq ON account_role (
  account DESC, role DESC, namespace DESC
) WHERE deleted_on IS NULL;

CREATE INDEX account_role__account__idx ON account_role (
  account DESC
);

CREATE INDEX account_role__role__idx ON account_role (
  role DESC
);

CREATE INDEX account_role__namespace__idx ON account_role (
  namespace DESC
);

CREATE FUNCTION ensure_account_role (
  account TEXT,
  role TEXT,
  namespace TEXT,
  created_on TIMESTAMP WITH TIME ZONE,
  created_by TEXT
) RETURNS text AS
$$
DECLARE
  id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(current_schema() || '_account_role_' || account || '_' || role || '_' || namespace));

  SELECT account_role.id INTO id FROM account_role WHERE account_role.account = ensure_account_role.account AND account_role.role = ensure_account_role.role AND account_role.namespace = ensure_account_role.namespace;
  IF NOT FOUND THEN
    INSERT INTO account_role (
      id,
      account,
      role,
      namespace,
      created_on,
      created_by
    ) values (
      uuid_generate_v4(),
      account,
      role,
      namespace,
      created_on,
      created_by
    ) RETURNING account_role.id INTO id;
  END IF;

  RETURN id;
END;
$$
LANGUAGE 'plpgsql';

COMMIT;
