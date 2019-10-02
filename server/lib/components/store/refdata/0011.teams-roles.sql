START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'teams-manage', 'Grants management (editing) access to teams api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'teams-read', 'Grants read access to teams api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;


INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'teams-manage') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'teams-manage') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'teams-read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'teams-read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'developer'), (SELECT id FROM permission WHERE name = 'teams-read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'observer'), (SELECT id FROM permission WHERE name = 'teams-read') )
ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
