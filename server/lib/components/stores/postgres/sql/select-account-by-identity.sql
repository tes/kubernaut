SELECT
  a.id,
  a.display_name,
  a.avatar,
  a.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name
FROM
  active_account__vw a,
  active_identity__vw i,
  account c
WHERE
  a.id = i.account AND
  a.created_by = c.id AND
  i.name = $1 AND
  i.provider = $2 AND
  i.type = $3
;
