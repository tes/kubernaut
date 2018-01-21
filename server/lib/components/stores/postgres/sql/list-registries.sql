SELECT
  r.id,
  r.name,
  r.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name
FROM
  active_registry__vw r,
  account c
WHERE
  r.created_by = c.id
ORDER BY
  r.name ASC
LIMIT
  $1
OFFSET
  $2
;
