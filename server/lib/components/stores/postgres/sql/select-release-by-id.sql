SELECT
  ar.id,
  ar.service_id,
  ar.service_name,
  ar.version,
  rt.id as template_id,
  rt.source_yaml as template_source_yaml,
  rt.source_json as template_source_json,
  rt.checksum as template_checksum,
  ar.created_on,
  ar.created_by
FROM
  active_release__vw ar, release_template rt
WHERE
  ar.id = $1 AND
  rt.id = ar.template
;
