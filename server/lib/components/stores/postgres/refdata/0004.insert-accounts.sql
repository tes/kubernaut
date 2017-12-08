START TRANSACTION;

INSERT INTO account (id, display_name, created_on, created_by) VALUES
  ('root', 'root', now(), null)
ON CONFLICT(id) DO NOTHING;

COMMIT;
