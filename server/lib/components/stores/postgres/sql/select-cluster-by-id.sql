SELECT
  c.id,
  c.name,
  c.context,
  c.created_on,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name
FROM
  active_cluster__vw c,
  account cb
WHERE c.id = $1
  AND c.created_by = cb.id
;
