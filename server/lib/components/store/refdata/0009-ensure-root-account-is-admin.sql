START TRANSACTION;

INSERT INTO account_roles (id, account, role, subject_type, created_on, created_by) VALUES
  ( uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', (SELECT id FROM role WHERE name = 'admin'), 'system', now(), '00000000-0000-0000-0000-000000000000' ),
  ( uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', (SELECT id FROM role WHERE name = 'admin'), 'global', now(), '00000000-0000-0000-0000-000000000000' )

ON CONFLICT DO NOTHING;

COMMIT;
