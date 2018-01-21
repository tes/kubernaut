SELECT
  r.id,
  r.name,
  r.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name
FROM
  active_registry__vw r,
  account c
WHERE
  r.name = $1 AND
  r.created_by = c.id
;
