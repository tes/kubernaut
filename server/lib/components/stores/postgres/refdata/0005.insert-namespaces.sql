START TRANSACTION;

INSERT INTO namespace (id, name, created_on, created_by) VALUES
  ('default', 'default', now(), 'root')
ON CONFLICT(id) DO NOTHING;

COMMIT;
