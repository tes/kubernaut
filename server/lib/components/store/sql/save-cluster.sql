INSERT INTO cluster (
  id,
  name,
  config,
  color,
  created_on,
  created_by,
  priority
) VALUES (
  uuid_generate_v4(),
  $1,
  $2,
  $3,
  $4,
  $5,
  $6
) RETURNING id;
