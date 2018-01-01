SELECT
  n.id,
  n.name
FROM
  active_namespace__vw n
WHERE
  n.name = $1
;
