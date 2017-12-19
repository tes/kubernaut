START TRANSACTION;

CREATE VIEW active_service__vw AS
SELECT
  s.*
FROM
  service s,
  active_namespace__vw n
WHERE
  s.deleted_on IS NULL AND
  s.namespace = n.id
ORDER BY
  s.created_on DESC,
  s.id DESC
;

COMMIT;
