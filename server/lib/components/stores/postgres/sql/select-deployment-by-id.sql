SELECT
  d.id,
  d.context,
  d.manifest_yaml,
  d.manifest_json,
  d.created_on,
  d.created_by,
  s.id AS service_id,
  s.name AS service_name,
  n.id AS namespace_id,
  n.name AS namespace_name,
  r.id AS release_id,
  r.version AS release_version
FROM
  active_deployment__vw d,
  release r,
  service s,
  namespace n
WHERE
  d.id = $1 AND
  d.release = r.id AND
  r.service = s.id AND
  s.namespace = n.id
;
