SELECT
  aa.id,
  aa.display_name,
  aa.avatar,
  aa.created_on,
  aa.created_by
FROM
  active_account__vw aa
WHERE
  aa.id = $1
;
