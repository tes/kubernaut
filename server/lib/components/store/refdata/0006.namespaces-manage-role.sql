START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'namespaces-manage', 'Grants management access to the namespaces api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;


INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'namespaces-manage') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'namespaces-manage') )

ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
