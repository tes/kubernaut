SELECT
  n.id,
  n.name,
  n.created_on,
  c.id AS cluster_id,
  c.name AS cluster_name,
  c.context AS cluster_context,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name
FROM
  active_namespace__vw n,
  cluster c,
  account cb
WHERE n.name = $1
  AND c.name = $2
  AND n.cluster = c.id
  AND n.created_by = cb.id
;
