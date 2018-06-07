START TRANSACTION;

INSERT INTO role (id, name, description) VALUES
  (uuid_generate_v4(), 'admin', 'Grants all permisions without scope'),
  (uuid_generate_v4(), 'maintainer', 'Grants read/write permissions on accounts, releases and deployments for a registry or namepsace'),
  (uuid_generate_v4(), 'developer', 'Grants read only permission on accounts, and read/write permissions on releases and deployments for a registry or namespace'),
  (uuid_generate_v4(), 'observer', 'Grants read only per permissions on accounts, releases and deployments for a registry or namespace')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

COMMIT;
