SELECT
  a.id,
  a.display_name,
  a.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name
FROM
  active_account__vw a,
  account c
WHERE
  a.created_by = c.id
ORDER BY
  a.display_name ASC,
  a.created_on DESC,
  a.id DESC
LIMIT
  $1
OFFSET
  $2
;
