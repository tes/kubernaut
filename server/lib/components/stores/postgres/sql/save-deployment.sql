INSERT INTO deployment (
  id,
  release,
  namespace,
  context,
  manifest_yaml,
  manifest_json,
  created_on,
  created_by
) VALUES (
  uuid_generate_v4(),
  (SELECT r.id FROM active_release__vw r WHERE r.id = $1),
  (SELECT n.id FROM active_namespace__vw n WHERE n.id = $2),
  $3,
  $4,
  $5,
  $6,
  $7
) RETURNING id;
