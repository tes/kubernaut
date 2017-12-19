SELECT
  r.id,
  r.version,
  r.template,
  r.created_on,
  r.created_by,
  s.id AS service_id,
  s.name AS service_name,
  n.id AS namespace_id,
  n.name AS namespace_name,
  rt.id as template_id,
  rt.source_yaml as template_source_yaml,
  rt.source_json as template_source_json,
  rt.checksum as template_checksum
FROM
  active_release__vw r,
  release_template rt,
  service s,
  namespace n
WHERE
  s.name = $1 AND
  n.name = $2 AND
  r.version = $3 AND
  r.service = s.id AND
  s.namespace = n.id AND
  r.template = rt.id
;
