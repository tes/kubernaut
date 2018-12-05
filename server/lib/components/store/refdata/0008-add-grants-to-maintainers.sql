START TRANSACTION;

INSERT INTO role_permission (id, role, permission)
VALUES
( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'namespaces-grant') ),
( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'registries-grant') )

ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
