INSERT INTO cluster (
  id,
  name,
  context,
  config,
  created_on,
  created_by
) VALUES (
  uuid_generate_v4(),
  $1,
  $2,
  $3,
  $4,
  $5
) RETURNING id;
