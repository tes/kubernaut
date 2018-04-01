START TRANSACTION;

INSERT INTO permission (id, name, description) VALUES
  (uuid_generate_v4(), 'client', 'Grants access to the UI'),
  (uuid_generate_v4(), 'accounts-read', 'Grants read access to the accounts api'),
  (uuid_generate_v4(), 'accounts-write', 'Grants write access to the accounts api'),
  (uuid_generate_v4(), 'registries-read', 'Grants read access to the registries api'),
  (uuid_generate_v4(), 'registries-write', 'Grants write access to the registries api'),
  (uuid_generate_v4(), 'registries-grant', 'Grants grant access to the registries api'),  
  (uuid_generate_v4(), 'releases-read', 'Grants read access to the releases api'),
  (uuid_generate_v4(), 'releases-write', 'Grants write access to the releases api'),
  (uuid_generate_v4(), 'clusters-read', 'Grants read access to the clusters api'),
  (uuid_generate_v4(), 'clusters-write', 'Grants write access to the clusters api'),
  (uuid_generate_v4(), 'namespaces-read', 'Grants read access to the namespaces api'),
  (uuid_generate_v4(), 'namespaces-write', 'Grants write access to the namespaces api'),
  (uuid_generate_v4(), 'namespaces-grant', 'Grants grant access to the namespaces api'),  
  (uuid_generate_v4(), 'deployments-read', 'Grants read access to the deployments api'),
  (uuid_generate_v4(), 'deployments-write', 'Grants write access to the deployments api')
ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description;

COMMIT;
