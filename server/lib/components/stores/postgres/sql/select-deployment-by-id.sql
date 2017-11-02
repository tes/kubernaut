SELECT
  d.id,
  d.release,
  d.context,
  d.created_on,
  d.created_by
FROM
  deployment d
WHERE
  d.id = $1
;
