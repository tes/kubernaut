START TRANSACTION;

CREATE VIEW active_release__vw AS
SELECT
  r.*
FROM
  release r,
  active_service__vw s
WHERE
  r.deleted_on IS NULL AND
  r.service = s.id
ORDER BY
  r.created_on DESC,
  r.id DESC
;

COMMIT;
