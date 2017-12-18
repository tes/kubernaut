START TRANSACTION;

CREATE VIEW active_identity__vw AS
SELECT
  i.*
FROM
  identity i
WHERE
  i.deleted_on IS NULL
ORDER BY
  i.created_by ASC,
  i.id
;

COMMIT;
