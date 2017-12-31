SELECT
  ensure_account_role(
    (SELECT aa.id FROM active_account__vw aa WHERE aa.id = $1),
    (SELECT r.id FROM role r WHERE r.name = $2),
    $3,
    $4,
    $5
  ) AS id
;
