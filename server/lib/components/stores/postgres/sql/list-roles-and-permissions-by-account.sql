SELECT
  COALESCE(sr.name, n.name) AS subject_name,
  ar.subject_type,
  r.name AS role_name,
  p.name AS permission_name
FROM active_account_role__vw ar
INNER JOIN role r
  ON ar.role = r.id
INNER JOIN role_permission rp
  ON rp.role = r.id
INNER JOIN permission p
  ON rp.permission = p.id
LEFT OUTER JOIN registry sr
   ON ar.subject = sr.id
  AND ar.subject_type = 'registry'
LEFT OUTER JOIN namespace n
   ON ar.subject = n.id
  AND ar.subject_type = 'namespace'
WHERE
  ar.account = $1
ORDER BY
  subject_name ASC,
  r.name ASC,
  p.name ASC
;
