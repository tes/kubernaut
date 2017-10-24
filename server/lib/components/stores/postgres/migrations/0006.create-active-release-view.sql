START TRANSACTION;

CREATE VIEW active_release__vw AS
SELECT
  r.id,
  s.id AS service_id,
  s.name AS service_name,
  r.version,
  r.template,
  r.created_on,
  r.created_by
FROM
  release r, service s
WHERE
  r.deleted_on IS NULL AND
  s.deleted_on IS NULL AND
  r.service = s.id
ORDER BY
  r.created_on DESC,
  r.id DESC
;

COMMIT;
