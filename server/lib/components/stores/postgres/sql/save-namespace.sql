INSERT INTO namespace (
  id,
  name,
  cluster,
  created_on,
  created_by
) VALUES (
  uuid_generate_v4(),
  $1,
  $2,
  $3,
  $4
) RETURNING id;
