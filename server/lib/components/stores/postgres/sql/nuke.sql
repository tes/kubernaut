START TRANSACTION;

TRUNCATE account CASCADE;
TRUNCATE namespace CASCADE;

INSERT INTO account (id, display_name, created_on, created_by) VALUES ('root', 'root', now(), null);

COMMIT;
