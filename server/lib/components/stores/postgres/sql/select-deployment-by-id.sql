SELECT
  d.id,
  d.context,
  d.manifest_yaml,
  d.manifest_json,
  d.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name,
  s.id AS service_id,
  s.name AS service_name,
  sr.id AS registry_id,
  sr.name AS registry_name,
  r.id AS release_id,
  r.version AS release_version,
  n.id AS namespace_id,
  n.name AS namespace_name
FROM
  active_deployment__vw d,
  release r,
  service s,
  registry sr,
  namespace n,
  account c
WHERE
  d.id = $1 AND
  d.release = r.id AND
  d.namespace = n.id AND
  d.created_by = c.id AND
  r.service = s.id AND
  s.registry = sr.id
;
