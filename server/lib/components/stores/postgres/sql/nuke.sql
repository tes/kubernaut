START TRANSACTION;

TRUNCATE account CASCADE;
TRUNCATE service CASCADE;

INSERT INTO account (id, display_name, created_on, created_by) VALUES ('root', 'root', now(), null);

COMMIT;
