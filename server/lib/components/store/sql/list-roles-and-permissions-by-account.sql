SELECT
  COALESCE(sr.id, n.id) AS subject_id,
  ar.differentiator,
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
  AND ar.differentiator = 'registry'
LEFT OUTER JOIN namespace n
   ON ar.subject = n.id
  AND ar.differentiator = 'namespace'
WHERE
  ar.account = $1
ORDER BY
  subject_id ASC,
  r.name ASC,
  p.name ASC
;
