INSERT INTO account_role (
  id,
  account,
  role,
  created_on,
  created_by
) VALUES (
  uuid_generate_v4(),
  (SELECT aa.id FROM active_account__vw aa WHERE aa.id = $1),
  (SELECT r.id FROM role r WHERE r.name = $2),
  $3,
  $4
) ON CONFLICT(account, role) DO UPDATE SET account = $1 RETURNING id;
-- ON CONFLICT DO UPDATE has some undesirable side-effects, namely
-- accidental fireing of triggers
-- write locks
-- creating garbage due to PostgreSQL MVCC model
-- None of these should matter for duplicate account roles, but don't copy this pattern without considering the consequences
