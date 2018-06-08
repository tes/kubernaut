UPDATE
  deployment
SET
  rollout_status_exit_code = $2
WHERE id = $1
  AND rollout_status_exit_code IS NULL
  AND deleted_on IS NULL
;
