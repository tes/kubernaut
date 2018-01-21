START TRANSACTION;

CREATE VIEW active_account_role__vw AS
SELECT
  'registry' AS differentiator,
  arr.*
FROM
  account_role_registry arr,
  active_account__vw a,
  active_registry__vw r
WHERE
  arr.deleted_on IS NULL AND
  arr.account = a.id AND
  arr.subject = r.id
UNION
SELECT
  'registry' AS differentiator,
  arr.*
FROM
  account_role_registry arr,
  active_account__vw a
WHERE
  arr.deleted_on IS NULL AND
  arr.account = a.id AND
  arr.subject IS NULL
UNION
SELECT
  'namespace' AS differentiator,
  arn.*
FROM
  account_role_namespace arn,
  active_account__vw a,
  active_namespace__vw n
WHERE
  arn.deleted_on IS NULL AND
  arn.account = a.id AND
  arn.subject = n.id
UNION
SELECT
  'namespace' AS differentiator,
  arn.*
FROM
  account_role_namespace arn,
  active_account__vw a
WHERE
  arn.deleted_on IS NULL AND
  arn.account = a.id AND
  arn.subject IS NULL
ORDER BY
  created_on DESC,
  id DESC
;

COMMIT;
