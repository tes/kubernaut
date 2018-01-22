SELECT
  r.id,
  r.name,
  r.created_on,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name
FROM
  active_registry__vw r,
  account cb
WHERE
  r.created_by = cb.id
ORDER BY
  r.name ASC
LIMIT
  $1
OFFSET
  $2
;
