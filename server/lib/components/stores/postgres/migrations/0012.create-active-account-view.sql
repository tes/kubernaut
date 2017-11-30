START TRANSACTION;

CREATE VIEW active_account__vw AS
SELECT
  a.id,
  a.identity,
  a.provider,
  a.display_name,
  a.created_on,
  a.created_by
FROM
  account a
WHERE
  a.deleted_on IS NULL
ORDER BY
  a.identity DESC,
  a.provider DESC
;

COMMIT;
