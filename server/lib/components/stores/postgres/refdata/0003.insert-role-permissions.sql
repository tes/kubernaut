START TRANSACTION;

INSERT INTO role_permission (id, role, permission) VALUES

  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'client') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'accounts_read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'accounts_write') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'role_grant') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'role_revoke') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'releases_read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'releases_write') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'deployments_read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'deployments_write') ),

  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'client') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'releases_read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'releases_write') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'deployments_read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'deployments_write') ),

  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'observer'), (SELECT id FROM permission WHERE name = 'client') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'observer'), (SELECT id FROM permission WHERE name = 'releases_read') ),
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'observer'), (SELECT id FROM permission WHERE name = 'deployments_read') )

ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
