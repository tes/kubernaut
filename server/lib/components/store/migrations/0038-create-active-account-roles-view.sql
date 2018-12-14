START TRANSACTION;

CREATE VIEW active_account_roles__vw AS (
  SELECT ar.*
  FROM
    account_roles ar,
    active_account__vw a
  WHERE ar.deleted_on IS NULL
    AND ar.account = a.id
);

COMMIT;
