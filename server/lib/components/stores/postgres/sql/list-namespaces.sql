SELECT
  n.id,
  n.name,
  n.created_on,
  n.created_by
FROM
  active_namespace__vw n
ORDER BY
  n.name ASC
LIMIT
  $1
OFFSET
  $2
;
