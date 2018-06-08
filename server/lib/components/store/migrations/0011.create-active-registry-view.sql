START TRANSACTION;

CREATE VIEW active_registry__vw AS
SELECT
  sr.*
FROM
  registry sr
WHERE
  sr.deleted_on IS NULL
ORDER BY
  sr.name ASC
;

COMMIT;
