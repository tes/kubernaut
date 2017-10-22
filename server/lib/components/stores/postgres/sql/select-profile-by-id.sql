SELECT
  p.id,
  p.name,
  p.version,
  p.created_on,
  p.created_by
FROM
  profile p
WHERE
  p.id = $1 AND
  p.deleted_on IS NULL
;
