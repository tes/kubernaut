SELECT
  r.id,
  s.id AS service_id,
  s.name AS service_name,
  r.version,
  t.id as template_id,
  t.source as template_source,
  t.checksum as template_checksum,
  r.created_on,
  r.created_by
FROM
  release r, service s, release_template t
WHERE
  r.id = $1 AND
  r.service = s.id AND
  r.deleted_on IS NULL AND
  s.deleted_on IS NULL
;
