SELECT
  a.id,
  a.display_name,
  a.created_on,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name
FROM
  active_account__vw a,
  account cb
WHERE
  a.created_by = cb.id
ORDER BY
  a.display_name ASC,
  a.created_on DESC,
  a.id DESC
LIMIT
  $1
OFFSET
  $2
;
