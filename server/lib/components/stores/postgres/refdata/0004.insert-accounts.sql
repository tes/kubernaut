START TRANSACTION;

INSERT INTO account (id, display_name, is_root, created_on, created_by) VALUES
  ('00000000-0000-0000-0000-000000000000', 'root', true, now(), null)
ON CONFLICT(id) DO NOTHING;

COMMIT;
