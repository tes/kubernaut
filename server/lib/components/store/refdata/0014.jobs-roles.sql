START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'jobs-read', 'Grants read access to jobs api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'jobs-write', 'Grants write access to jobs api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;


INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'jobs-write') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'jobs-read') )
ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
