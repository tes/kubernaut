SELECT
  r.id,
  s.id AS service_id,
  s.name AS service_name,
  r.version,
  r.created_on,
  r.created_by
FROM
  release r, service s
WHERE
  r.deleted_on IS NULL AND
  s.deleted_on IS NULL AND
  r.service = s.id
ORDER BY
  -- Using coalesce to take advantage of release__deleted_on__created_on__service__idx
  COALESCE(r.deleted_on, r.created_on) DESC,
  r.id DESC
LIMIT
  $1
OFFSET
  $2
;
