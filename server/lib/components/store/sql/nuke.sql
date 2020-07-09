START TRANSACTION;

-- DELETE appears faster than truncate on small tables
DELETE FROM audit;
DELETE FROM ingress_entry_rule;
DELETE FROM ingress_entry_annotation;
DELETE FROM ingress_entry;
DELETE FROM ingress_version;
DELETE FROM cluster_ingress_host;
DELETE FROM cluster_ingress_variable;
DELETE FROM cluster_ingress_class;
DELETE FROM ingress_class;
DELETE FROM ingress_host_key;
DELETE FROM ingress_variable_key;
DELETE FROM job_version;
DELETE FROM job;
DELETE FROM team_attribute;
DELETE FROM team_service;
DELETE FROM team;
DELETE FROM deployment_attribute;
DELETE FROM deployment_log_entry;
DELETE FROM deployment;
DELETE FROM release_template;
DELETE FROM release_attribute;
DELETE FROM release;
DELETE FROM secret_version_data;
DELETE FROM secret_version;
DELETE FROM service;
DELETE FROM registry WHERE NOT id = '00000000-0000-0000-0000-000000000000';
DELETE FROM namespace;
DELETE FROM cluster;
DELETE FROM account_roles WHERE account <> '00000000-0000-0000-0000-000000000000';
DELETE FROM identity;
DELETE FROM account WHERE NOT id = '00000000-0000-0000-0000-000000000000';

COMMIT;
