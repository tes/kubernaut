INSERT INTO release (
  id,
  name,
  version,
  description,
  template,
  created_on,
  created_by
) VALUES (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7
);
