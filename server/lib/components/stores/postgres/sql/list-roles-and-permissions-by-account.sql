SELECT
  r.name AS role_name,
  p.name AS permission_name
FROM
  active_account_role__vw ar,
  role r,
  role_permission rp,
  permission p
WHERE
  ar.account = $1 AND
  ar.role = r.id AND
  ar.role = rp.role AND
  rp.permission = p.id
ORDER BY
  r.name DESC,
  p.name DESC
;
