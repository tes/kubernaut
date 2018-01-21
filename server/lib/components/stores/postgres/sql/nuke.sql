START TRANSACTION;

-- DELETE appears faster than truncate on small tables
DELETE FROM deployment_log_entry;
DELETE FROM deployment;
DELETE FROM release_template;
DELETE FROM release_attribute;
DELETE FROM release;
DELETE FROM service;
DELETE FROM registry WHERE NOT id = '00000000-0000-0000-0000-000000000000';
DELETE FROM namespace WHERE NOT id = '00000000-0000-0000-0000-000000000000';
DELETE FROM cluster;
DELETE FROM account_role_namespace;
DELETE FROM identity;
DELETE FROM account WHERE NOT id = '00000000-0000-0000-0000-000000000000';

REFRESH MATERIALIZED VIEW entity_count__mvw;

COMMIT;
