START TRANSACTION;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'jobs-write') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'jobs-read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'jobs-apply') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'developer'), (SELECT id FROM permission WHERE name = 'jobs-write') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'developer'), (SELECT id FROM permission WHERE name = 'jobs-read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'developer'), (SELECT id FROM permission WHERE name = 'jobs-apply') )
ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
