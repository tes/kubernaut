SELECT
  n.name AS namespace_name,
  r.name AS role_name,
  p.name AS permission_name
FROM
  active_account_role__vw ar
INNER JOIN role r ON ar.role = r.id
INNER JOIN role_permission rp ON rp.role = r.id
INNER JOIN permission p ON rp.permission = p.id
LEFT OUTER JOIN namespace n ON ar.namespace = n.id
WHERE
  ar.account = $1
ORDER BY
  n.name DESC,
  r.name DESC,
  p.name DESC
;
