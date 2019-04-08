INSERT INTO release (
  id,
  service,
  version,
  template,
  created_on,
  created_by,
  comment
) VALUES (
  uuid_generate_v4(),
  $1,
  $2,
  $3,
  $4,
  $5,
  $6
) RETURNING id;
