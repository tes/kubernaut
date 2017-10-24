SELECT
  ar.id,
  ar.service_id,
  ar.service_name,
  ar.version,
  rt.id as template_id,
  rt.source as template_source,
  rt.checksum as template_checksum,
  ar.created_on,
  ar.created_by
FROM
  active_release__vw ar, release_template rt
WHERE
  ar.id = $1 AND
  rt.id = ar.template
;
