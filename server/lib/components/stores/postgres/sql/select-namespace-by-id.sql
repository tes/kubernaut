SELECT
  n.id,
  n.name,
  n.created_on,
  n.created_by
FROM
  active_namespace__vw n
WHERE
  n.id = $1
;
