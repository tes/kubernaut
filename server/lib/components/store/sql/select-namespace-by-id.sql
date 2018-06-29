SELECT
  n.id,
  n.name,
  n.context,
  n.created_on,
  n.color,
  c.id AS cluster_id,
  c.name AS cluster_name,
  c.config AS cluster_config,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name
FROM
  active_namespace__vw n,
  account cb,
  cluster c
WHERE n.id = $1
  AND n.cluster = c.id
  AND n.created_by = cb.id
;
