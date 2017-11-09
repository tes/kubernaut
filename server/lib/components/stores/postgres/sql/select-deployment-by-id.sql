SELECT
  ad.id,
  ad.service_id,
  ad.service_name,
  ad.service_created_on,
  ad.service_created_by,
  ad.release_id,
  ad.release_version,
  ad.release_created_on,
  ad.release_created_by,
  rt.id AS release_template_id,
  rt.source AS release_template_source,
  rt.checksum AS release_template_checksum,
  ad.created_on,
  ad.created_by
FROM
  active_deployment__vw ad, release_template rt
WHERE
  ad.id = $1 AND
  rt.id = ad.release_template
;
