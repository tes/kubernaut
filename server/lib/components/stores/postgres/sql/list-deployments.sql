SELECT
  ad.id,
  ad.context,
  ad.service_id,
  ad.service_name,
  ad.service_created_on,
  ad.service_created_by,
  ad.release_id,
  ad.release_version,
  ad.release_created_on,
  ad.release_created_by,
  ad.created_on,
  ad.created_by
FROM
  active_deployment__vw ad
ORDER BY
  ad.created_on DESC,
  ad.id DESC
LIMIT
  $1
OFFSET
  $2
;
