UPDATE
  account_role_registry
SET
  deleted_on = $2,
  deleted_by = $3
WHERE
  id = $1 AND
  deleted_on IS NULL
;

