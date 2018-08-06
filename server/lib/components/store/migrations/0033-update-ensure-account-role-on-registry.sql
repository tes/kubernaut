START TRANSACTION;

CREATE OR REPLACE FUNCTION ensure_account_role_on_registry (
  account UUID,
  role UUID,
  subject UUID,
  created_on TIMESTAMP WITH TIME ZONE,
  created_by UUID
) RETURNS UUID AS
$$
DECLARE
  id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(current_schema() || '_account_role_registry_' || account || '_' || role || '_' || subject));

  SELECT account_role_registry.id INTO id
  FROM account_role_registry
  WHERE account_role_registry.account = ensure_account_role_on_registry.account
    AND account_role_registry.role = ensure_account_role_on_registry.role
    AND account_role_registry.subject = ensure_account_role_on_registry.subject
    AND account_role_registry.deleted_on IS NULL
    AND account_role_registry.deleted_by IS NULL;
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
