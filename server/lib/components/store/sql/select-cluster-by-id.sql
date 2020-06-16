SELECT
  c.id,
  c.name,
  c.config,
  c.created_on,
  c.color,
  c.priority,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name
FROM
  active_cluster__vw c,
  account cb
WHERE c.id = $1
  AND c.created_by = cb.id
;
