SELECT
  r.id,
  r.version,
  r.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name,
  s.id AS service_id,
  s.name AS service_name,
  n.id AS namespace_id,
  n.name AS namespace_name
FROM
  active_release__vw r,
  service s,
  namespace n,
  account c
WHERE
  r.service = s.id AND
  r.created_by = c.id AND
  s.namespace = n.id
ORDER BY
  r.created_on DESC,
  r.id DESC
LIMIT
  $1
OFFSET
  $2
;
