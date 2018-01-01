START TRANSACTION;

TRUNCATE account CASCADE;
TRUNCATE namespace CASCADE;

INSERT INTO account (id, display_name, created_on, created_by) VALUES ('00000000-0000-0000-0000-000000000000', 'root', now(), null);
INSERT INTO namespace (id, name, created_on, created_by) VALUES ('00000000-0000-0000-0000-000000000000', 'default', now(), '00000000-0000-0000-0000-000000000000');


COMMIT;
