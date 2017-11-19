INSERT INTO deployment (
  id,
  release,
  context,
  manifest_yaml,
  manifest_json,
  created_on,
  created_by
) VALUES (
  uuid_generate_v4(),
  $1,
  $2,
  $3,
  $4,
  $5,
  $6
) RETURNING id;
