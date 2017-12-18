START TRANSACTION;

CREATE VIEW active_account_role__vw AS
SELECT
  ar.*
FROM
  account_role ar,
  active_account__vw a
WHERE
  ar.deleted_on IS NULL AND
  ar.account = a.id
ORDER BY
  ar.created_on DESC,
  ar.id DESC
;

COMMIT;
