SELECT
  d.id,
  d.context,
  d.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name,
  r.id AS release_id,
  r.version AS release_version,
  s.id AS service_id,
  s.name AS service_name,
  n.id AS namespace_id,
  n.name AS namespace_name
FROM
  active_deployment__vw d,
  release r,
  service s,
  namespace n,
  account c
WHERE
  d.release = r.id AND
  d.namespace = n.id AND
  d.created_by = c.id AND
  r.service = s.id
ORDER BY
  d.created_on DESC,
  d.id DESC
LIMIT
  $1
OFFSET
  $2
;
