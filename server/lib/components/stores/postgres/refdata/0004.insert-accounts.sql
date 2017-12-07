START TRANSACTION;

INSERT INTO account (id, display_name, created_on, created_by) VALUES
  ( '4da9055f-4ac7-4bd6-8c29-6df10d46bc5c', 'root', now(), '4da9055f-4ac7-4bd6-8c29-6df10d46bc5c')
ON CONFLICT(id) DO NOTHING;

COMMIT;
