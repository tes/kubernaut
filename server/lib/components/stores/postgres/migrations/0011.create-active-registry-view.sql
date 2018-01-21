START TRANSACTION;

CREATE VIEW active_registry__vw AS
SELECT
  r.*
FROM
  registry r
WHERE
  r.deleted_on IS NULL
ORDER BY
  r.name ASC
;

COMMIT;
