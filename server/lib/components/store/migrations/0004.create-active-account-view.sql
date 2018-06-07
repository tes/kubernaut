START TRANSACTION;

CREATE VIEW active_account__vw AS
SELECT
  a.*
FROM
  account a
WHERE
  a.deleted_on IS NULL
ORDER BY
  a.created_on ASC,
  a.id DESC
;

COMMIT;
