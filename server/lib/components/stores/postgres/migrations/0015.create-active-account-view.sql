START TRANSACTION;

CREATE VIEW active_account__vw AS
SELECT
  a.id,
  a.display_name,
  a.created_on,
  a.created_by
FROM
  account a
WHERE
  a.deleted_on IS NULL
ORDER BY
  a.display_name DESC,
  a.created_on DESC,
  a.id DESC
;

COMMIT;
