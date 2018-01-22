SELECT
  r.id,
  r.version,
  r.created_on,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name,
  s.id AS service_id,
  s.name AS service_name,
  sr.id AS registry_id,
  sr.name AS registry_name
FROM
  active_release__vw r,
  service s,
  registry sr,
  account cb
WHERE
  r.service = s.id AND
  r.created_by = cb.id AND
  s.registry = sr.id
ORDER BY
  r.created_on DESC,
  r.id DESC
LIMIT
  $1
OFFSET
  $2
;
