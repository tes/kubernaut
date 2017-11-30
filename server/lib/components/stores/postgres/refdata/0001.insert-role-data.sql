-- @MARV AUDIT = false
-- Disable audit so we can insert new roles without creating a new migrations file

START TRANSACTION;

INSERT INTO role (id, name, description) VALUES
  (uuid_generate_v4(), 'admin', 'Grants all permisions'),
  (uuid_generate_v4(), 'developer', 'Grants releases, deployments and client permissions'),
  (uuid_generate_v4(), 'ci', 'Grants releases and deployments permissions')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

COMMIT;
