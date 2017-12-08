SELECT
  count(distinct(aa.id)) AS active_administrators
FROM
  active_account__vw aa,
  active_identity__vw ai,
  active_account_role__vw aar,
  role r
WHERE
  aa.id = ai.account AND
  aa.id = aar.account AND
  r.id = aar.role AND
  r.name = 'admin'
;
