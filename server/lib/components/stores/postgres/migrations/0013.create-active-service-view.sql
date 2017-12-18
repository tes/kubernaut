START TRANSACTION;

CREATE VIEW active_service__vw AS
SELECT
  s.*
FROM
  service s
WHERE
  s.deleted_on IS NULL
ORDER BY
  s.created_on DESC,
  s.id DESC
;

COMMIT;
