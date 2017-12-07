START TRANSACTION;

INSERT INTO role (id, name, description) VALUES
  (uuid_generate_v4(), 'admin', 'Grants all permisions'),
  (uuid_generate_v4(), 'maintainer', 'Grants releases, deployments and client permissions'),
  (uuid_generate_v4(), 'observer', 'Grants client permissions'),
  (uuid_generate_v4(), 'ci', 'Grants releases and deployments permissions')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

COMMIT;
