SELECT
  a.id,
  a.display_name,
  a.avatar,
  a.created_on,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name
FROM
  active_account__vw a,
  account cb
WHERE a.id = $1
  AND a.created_by = cb.id
;
