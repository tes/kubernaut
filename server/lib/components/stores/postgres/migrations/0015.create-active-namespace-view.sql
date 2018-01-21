START TRANSACTION;

CREATE VIEW active_namespace__vw AS
SELECT
  n.*
FROM
  namespace n
WHERE
  n.deleted_on IS NULL
ORDER BY
  n.name ASC
;

COMMIT;
