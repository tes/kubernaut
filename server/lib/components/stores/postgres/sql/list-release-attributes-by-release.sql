SELECT
  ra.name,
  ra.value,
  ra.release
FROM
  release_attribute ra
WHERE
  ra.release = $1
ORDER BY
  name DESC;
;
