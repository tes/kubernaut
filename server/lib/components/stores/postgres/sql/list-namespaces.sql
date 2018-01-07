SELECT
  n.id,
  n.name,
  n.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name
FROM
  active_namespace__vw n,
  account c
WHERE
  n.created_by = c.id
ORDER BY
  n.name ASC
LIMIT
  $1
OFFSET
  $2
;
