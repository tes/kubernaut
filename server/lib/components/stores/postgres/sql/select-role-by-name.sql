SELECT
  r.id,
  r.name
FROM
  role r
WHERE
  r.name = $1
;
