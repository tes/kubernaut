SELECT
  (
    SELECT count(ar.id)
    FROM
      active_account_role__vw ar,
      role r
    WHERE ar.role = r.id
      AND ar.differentiator = 'registry'
      AND r.name = 'admin'
  ) AS registry,
  (
    SELECT count(ar.id)
    FROM
      active_account_role__vw ar,
      role r
    WHERE ar.role = r.id
      AND ar.differentiator = 'namespace'
      AND r.name = 'admin'
  ) AS namespace
;
