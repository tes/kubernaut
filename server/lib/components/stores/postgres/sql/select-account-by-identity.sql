SELECT
  aa.id,
  aa.display_name,
  aa.avatar,
  aa.created_on,
  aa.created_by
FROM
  active_account__vw aa,
  active_identity__vw ai
WHERE
  aa.id = ai.account AND
  ai.name = $1 AND
  ai.provider = $2 AND
  ai.type = $3
;
