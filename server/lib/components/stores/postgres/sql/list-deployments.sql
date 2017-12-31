SELECT
  d.id,
  d.context,
  d.created_on,
  d.created_by,
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
  namespace n
WHERE
  d.release = r.id AND
  r.service = s.id AND
  s.namespace = n.id
ORDER BY
  d.created_on DESC,
  d.id DESC
LIMIT
  $1
OFFSET
  $2
;
