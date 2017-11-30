-- @MARV AUDIT = false
-- Disable audit so we can insert new permissions without creating a new migrations file

START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'system-read', 'Grants read access to the system api'),
  (uuid_generate_v4(), 'users-read', 'Grants read access to the users api'),
  (uuid_generate_v4(), 'users-write', 'Grants write access to the users api'),
  (uuid_generate_v4(), 'releases-read', 'Grants read access to the releases api'),
  (uuid_generate_v4(), 'releases-write', 'Grants write access to the releases api'),
  (uuid_generate_v4(), 'deployments-read', 'Grants read access to the deployments api'),
  (uuid_generate_v4(), 'deployments-write', 'Grants write access to the deployments api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

COMMIT;
