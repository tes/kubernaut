START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'secrets-manage', 'Grants management (editing) access to secrets api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'secrets-apply', 'Grants usage of secrets (i.e, in deployments) without accessing secure data')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;


INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'secrets-manage') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'secrets-manage') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'secrets-apply') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'secrets-apply') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'developer'), (SELECT id FROM permission WHERE name = 'secrets-apply') )
ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
