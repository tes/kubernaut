SELECT
  ensure_account_role_on_namespace($1, (SELECT id FROM role WHERE name = $2), $3, $4, $5) AS id
;
