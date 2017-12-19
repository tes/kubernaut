SELECT
  r.id,
  r.version,
  r.created_on,
  r.created_by,
  s.id AS service_id,
  s.name AS service_name,
  n.id AS namespace_id,
  n.name AS namespace_name
FROM
  active_release__vw r,
  service s,
  namespace n
WHERE
  r.service = s.id AND
  s.namespace = n.id
ORDER BY
  r.created_on DESC,
  r.id DESC
LIMIT
  $1
OFFSET
  $2
;
