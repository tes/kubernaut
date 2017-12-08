START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'client', 'Grants access to the UI'),
  (uuid_generate_v4(), 'accounts-read', 'Grants read access to the accounts api'),
  (uuid_generate_v4(), 'accounts-write', 'Grants write access to the accounts api'),
  (uuid_generate_v4(), 'role-grant', 'Grants a role to an account'),
  (uuid_generate_v4(), 'role-revoke', 'Revokes a role from an account'),
  (uuid_generate_v4(), 'releases-read', 'Grants read access to the releases api'),
  (uuid_generate_v4(), 'releases-write', 'Grants write access to the releases api'),
  (uuid_generate_v4(), 'deployments-read', 'Grants read access to the deployments api'),
  (uuid_generate_v4(), 'deployments-write', 'Grants write access to the deployments api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

COMMIT;
