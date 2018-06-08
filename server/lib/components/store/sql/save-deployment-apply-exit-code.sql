UPDATE
  deployment
SET
  apply_exit_code = $2
WHERE id = $1
  AND apply_exit_code IS NULL
  AND deleted_on IS NULL
;
