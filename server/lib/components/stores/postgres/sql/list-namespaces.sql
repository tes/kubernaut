SELECT
  n.id,
  n.name
FROM
  active_namespace__vw n
ORDER BY
  n.name ASC
LIMIT
  $1
OFFSET
  $2
;
