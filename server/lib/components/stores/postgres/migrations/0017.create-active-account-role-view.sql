START TRANSACTION;

CREATE VIEW active_account_role__vw AS
SELECT
  ar.id,
  ar.account,
  ar.role,
  ar.created_on,
  ar.created_by
FROM
  account_role ar,
  role r
WHERE
  ar.deleted_on IS NULL AND
  ar.role = r.id
ORDER BY
  ar.id DESC
;

COMMIT;
