START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'ingress-read', 'Grants read access to ingress api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'ingress-write', 'Grants write access to ingress api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'ingress-admin', 'Grants read and write access to ingress admininistration api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'ingress-read') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'ingress-write') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'ingress-admin') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'ingress-read') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'ingress-write') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'developer'), (SELECT id FROM permission WHERE name = 'ingress-read') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'developer'), (SELECT id FROM permission WHERE name = 'ingress-write') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'observer'), (SELECT id FROM permission WHERE name = 'ingress-read') )
ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
