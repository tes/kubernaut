INSERT INTO account (
  id,
  display_name,
  created_on,
  created_by
) VALUES (
  uuid_generate_v4(),
  $1,
  $2,
  $3
) RETURNING id;
