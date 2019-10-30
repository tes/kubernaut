START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'accounts-bearer', 'Grants generation of another users bearer token')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;



INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'accounts-bearer') )
ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
