UPDATE
  account_role_registry
SET
  deleted_on = $4,
  deleted_by = $5
WHERE account = $1
  AND role = (SELECT id FROM role WHERE name = $2)
  AND subject = $3
  AND deleted_on IS NULL
;
