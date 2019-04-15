SELECT
  d.id,
  d.manifest_yaml,
  d.manifest_json,
  d.apply_exit_code,
  d.rollout_status_exit_code,
  d.created_on,
  d.note,
  cb.id AS created_by_id,
  cb.display_name AS created_by_display_name,
  s.id AS service_id,
  s.name AS service_name,
  sr.id AS registry_id,
  sr.name AS registry_name,
  r.id AS release_id,
  r.version AS release_version,
  n.id AS namespace_id,
  n.name AS namespace_name,
  n.context AS namespace_context,
  n.color AS namespace_color,
  c.id AS cluster_id,
  c.name AS cluster_name,
  c.config AS cluster_config,
  c.color AS cluster_color
FROM
  active_deployment__vw d,
  release r,
  service s,
  registry sr,
  namespace n,
  cluster c,
  account cb
WHERE d.id = $1
  AND d.release = r.id
  AND d.namespace = n.id
  AND d.created_by = cb.id
  AND n.cluster = c.id
  AND r.service = s.id
  AND s.registry = sr.id
;
