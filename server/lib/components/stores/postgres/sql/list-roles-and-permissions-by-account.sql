SELECT
  aar.id,
  r.name AS role_name,
  p.name AS permission_name,
  aar.created_on,
  aar.created_by
FROM
  active_account__vw aa,
  active_account_role__vw aar,
  role r,
  role_permission rp,
  permission p
WHERE
  aa.id = $1 AND
  aa.id = aar.account AND
  r.id = aar.role AND
  r.id = rp.role AND
  p.id = rp.permission
ORDER BY
  r.name DESC,
  p.name DESC
;
