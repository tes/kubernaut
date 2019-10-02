START TRANSACTION;

ALTER TABLE account_roles
  DROP CONSTRAINT subject_type_check,

  ADD CONSTRAINT subject_type_check CHECK (subject_type IN (
    'team',
    'namespace',
    'registry',
    'system',
    'global'
  ));
COMMIT;
