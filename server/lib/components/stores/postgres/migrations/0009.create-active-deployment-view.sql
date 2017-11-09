START TRANSACTION;

CREATE VIEW active_deployment__vw AS
SELECT
  d.id,
  s.id AS service_id,
  s.name AS service_name,
  r.id AS release_id,
  r.version AS release_version,
  r.template AS release_template,
  d.created_on AS created_on,
  d.created_by AS created_by,
  r.created_on AS release_created_on,
  r.created_by AS release_created_by,
  s.created_on AS service_created_on,
  s.created_by AS service_created_by
FROM
  deployment d, release r, service s
WHERE
  d.deleted_on IS NULL AND
  r.deleted_on IS NULL AND
  s.deleted_on IS NULL AND
  d.release = r.id AND
  r.service = s.id
ORDER BY
  d.created_on DESC,
  d.id DESC
;

COMMIT;
