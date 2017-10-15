SELECT
  id,
  name,
  version,
  description,
  template,
  created_on,
  created_by
FROM
  release
WHERE
  id = $1 AND
  deleted_on IS NULL
;
