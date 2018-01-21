START TRANSACTION;

CREATE VIEW active_account_role__vw AS
SELECT
  ar.*
FROM
  account_role ar,
  active_account__vw a,
  active_namespace__vw n
WHERE
  ar.deleted_on IS NULL AND
  ar.account = a.id AND
  ar.namespace = n.id
UNION
SELECT
  ar.*
FROM
  account_role ar,
  active_account__vw a
WHERE
  ar.deleted_on IS NULL AND
  ar.account = a.id AND
  ar.namespace IS NULL
ORDER BY
  created_on DESC,
  id DESC
;

COMMIT;
