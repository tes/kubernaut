SELECT
  r.id,
  r.version,
  r.template,
  r.created_on,
  c.id AS created_by_id,
  c.display_name AS created_by_display_name,
  s.id AS service_id,
  s.name AS service_name,
  sr.id AS registry_id,
  sr.name AS registry_name,
  rt.id as template_id,
  rt.source_yaml as template_source_yaml,
  rt.source_json as template_source_json,
  rt.checksum as template_checksum
FROM
  active_release__vw r,
  release_template rt,
  service s,
  registry sr,
  account c
WHERE
  r.id = $1 AND
  r.service = s.id AND
  r.created_by = c.id AND
  r.template = rt.id AND
  s.registry = sr.id
;
