SELECT
  count(distinct(ar.id)) AS active_global_administrators
FROM
  active_account_role__vw ar,
  role r
WHERE
  ar.role = r.id AND
  r.name = 'admin' AND
  ar.namespace IS NULL
;
