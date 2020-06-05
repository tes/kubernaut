START TRANSACTION;

DROP FUNCTION ensure_account_role_on_namespace(uuid, uuid, uuid, timestamp with time zone, uuid);
DROP FUNCTION ensure_account_role_on_registry(uuid, uuid, uuid, timestamp with time zone, uuid);

DROP VIEW active_account_role__vw;
DROP TABLE account_role_namespace;
DROP TABLE account_role_registry;


COMMIT;
