SELECT
  p.id,
  p.name,
  p.version,
  p.created_on,
  p.created_by
FROM
  profile p
WHERE
  p.deleted_on IS NULL
ORDER BY
  -- Using coalesce to take advantage of release__deleted_on__created_on__service__idx
  COALESCE(p.deleted_on, p.created_on) DESC,
  p.id DESC
LIMIT
  $1
OFFSET
  $2
;
