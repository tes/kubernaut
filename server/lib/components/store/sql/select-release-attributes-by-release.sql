SELECT
  name,
  value,
  release
FROM
  release_attribute
WHERE
  release = $1
;
