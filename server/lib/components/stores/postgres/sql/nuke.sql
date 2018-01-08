START TRANSACTION;

-- DELETE appears faster than truncate on small tables
DELETE FROM deployment_log_entry;
DELETE FROM deployment;
DELETE FROM release_template;
DELETE FROM release_attribute;
DELETE FROM release;
DELETE FROM service;
DELETE FROM namespace;
DELETE FROM account_role;
DELETE FROM identity;
DELETE FROM account;

INSERT INTO account (id, display_name, created_on, created_by) VALUES ('00000000-0000-0000-0000-000000000000', 'root', now(), '00000000-0000-0000-0000-000000000000');
INSERT INTO namespace (id, name, created_on, created_by) VALUES ('00000000-0000-0000-0000-000000000000', 'default', now(), '00000000-0000-0000-0000-000000000000');

REFRESH MATERIALIZED VIEW entity_count__mvw;

COMMIT;
