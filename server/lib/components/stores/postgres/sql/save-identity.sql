INSERT INTO identity (
  id,
  account,
  name,
  provider,
  type,
  created_on,
  created_by
) VALUES (
  uuid_generate_v4(),
  (SELECT aa.id FROM active_account__vw aa WHERE aa.id = $1),
  $2,
  $3,
  $4,
  $5,
  $6
) RETURNING id;
