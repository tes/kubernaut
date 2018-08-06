START TRANSACTION;

CREATE OR REPLACE FUNCTION ensure_account_role_on_namespace (
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
  PERFORM pg_advisory_xact_lock(hashtext(current_schema() || '_account_role_namespace_' || account || '_' || role || '_' || subject));

  SELECT account_role_namespace.id INTO id
  FROM account_role_namespace
  WHERE account_role_namespace.account = ensure_account_role_on_namespace.account
    AND account_role_namespace.role = ensure_account_role_on_namespace.role
    AND account_role_namespace.subject = ensure_account_role_on_namespace.subject
    AND account_role_namespace.deleted_on IS NULL
    AND account_role_namespace.deleted_by IS NULL;
  IF NOT FOUND THEN
    INSERT INTO account_role_namespace (
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
    ) RETURNING account_role_namespace.id INTO id;
  END IF;

  RETURN id;
END;
$$
LANGUAGE 'plpgsql';

COMMIT;
