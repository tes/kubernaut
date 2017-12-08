START TRANSACTION;

CREATE VIEW active_identity__vw AS
SELECT
  i.id,
  i.account,
  i.name,
  i.provider,
  i.type,
  i.created_on,
  i.created_by
FROM
  identity i
WHERE
  i.deleted_on IS NULL
ORDER BY
  i.name DESC,
  i.provider DESC,
  i.type DESC
;

COMMIT;
