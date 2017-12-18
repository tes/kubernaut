SELECT
  r.id,
  r.version,
  r.created_on,
  r.created_by,
  s.id AS service_id,
  s.name AS service_name
FROM
  active_release__vw r, service s
WHERE
  r.service = s.id
ORDER BY
  r.created_on DESC,
  r.id DESC
LIMIT
  $1
OFFSET
  $2
;
