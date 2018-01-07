SELECT
  a.id,
  a.display_name,
  a.avatar,
  a.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name
FROM
  active_account__vw a,
  account c
WHERE
  a.id = $1 AND
  a.created_by = c.id
;
