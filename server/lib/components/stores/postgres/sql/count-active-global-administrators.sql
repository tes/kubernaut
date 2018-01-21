SELECT
  (
    SELECT count(ar.id)
    FROM
      active_account_role__vw ar,
      role r
    WHERE ar.role = r.id
      AND ar.subject_type = 'registry'
      AND r.name = 'admin'
  ) AS registry,
  (
    SELECT count(ar.id)
    FROM
      active_account_role__vw ar,
      role r
    WHERE ar.role = r.id
      AND ar.subject_type = 'namespace'
      AND r.name = 'admin'
  ) AS namespace
;
