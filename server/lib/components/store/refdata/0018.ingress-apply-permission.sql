START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'ingress-apply', 'Grants usage of ingress (i.e, in deployments)')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'admin'), (SELECT id FROM permission WHERE name = 'ingress-apply') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'maintainer'), (SELECT id FROM permission WHERE name = 'ingress-apply') )
ON CONFLICT(role, permission) DO NOTHING;

INSERT INTO role_permission (id, role, permission) VALUES
  ( uuid_generate_v4(), (SELECT id FROM role WHERE name = 'developer'), (SELECT id FROM permission WHERE name = 'ingress-apply') )
ON CONFLICT(role, permission) DO NOTHING;

COMMIT;
