START TRANSACTION;

CREATE VIEW active_service__vw AS
SELECT
  s.*
FROM
  service s,
  active_registry__vw sr
WHERE
  s.deleted_on IS NULL AND
  s.registry = sr.id
ORDER BY
  s.created_on DESC,
  s.id DESC
;

COMMIT;
