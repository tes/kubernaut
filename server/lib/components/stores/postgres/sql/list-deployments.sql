SELECT
  d.id,
  d.created_on,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name,
  r.id AS release_id,
  r.version AS release_version,
  s.id AS service_id,
  s.name AS service_name,
  n.id AS namespace_id,
  n.name AS namespace_name,
  c.id AS cluster_id,
  c.name AS cluster_name,
  c.context AS cluster_context
FROM
  active_deployment__vw d,
  release r,
  service s,
  namespace n,
  cluster c,
  account cb
WHERE d.release = r.id
  AND d.namespace = n.id
  AND d.created_by = cb.id
  AND n.cluster = c.id
  AND r.service = s.id
ORDER BY
  d.created_on DESC,
  d.id DESC
LIMIT
  $1
OFFSET
  $2
;
