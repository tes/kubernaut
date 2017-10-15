SELECT
  id,
  name,
  version,
  description,
  created_on,
  created_by
FROM
  release
WHERE
  deleted_on IS NULL
ORDER BY
  COALESCE(deleted_on, created_on) DESC,
  id DESC
LIMIT
  $1
OFFSET
  $2
;
