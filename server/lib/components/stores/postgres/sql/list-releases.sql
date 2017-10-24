SELECT
  ar.id,
  ar.service_id,
  ar.service_name,
  ar.version,
  ar.created_on,
  ar.created_by
FROM
  active_release__vw ar
WHERE
  ar.service = s.id
ORDER BY
  ar.created_on DESC,
  ar.id DESC
LIMIT
  $1
OFFSET
  $2
;
