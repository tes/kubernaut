START TRANSACTION;

CREATE TABLE team_roles (
  id UUID PRIMARY KEY,
  team UUID NOT NULL REFERENCES team ON DELETE CASCADE,
  role UUID NOT NULL REFERENCES role ON DELETE CASCADE,
  subject UUID,
  subject_type VARCHAR(16) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT team_roles__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL)),
  CONSTRAINT subject_type_check CHECK (subject_type IN (
    'namespace',
    'registry',
    'system',
    'global',
    'team'
  )),
  CONSTRAINT subject_null_check CHECK (
    (subject_type IN ('system', 'global') AND subject IS NULL)
    OR
    (subject IS NOT NULL)
  )
);

CREATE UNIQUE INDEX team_roles__team_role_subject_type__uniq ON team_roles (
  team DESC, role DESC, subject DESC, subject_type DESC
) WHERE deleted_on IS NULL;

CREATE UNIQUE INDEX team_roles__account_role_type__uniq ON team_roles (
  team DESC, role DESC, subject_type DESC
) WHERE deleted_on IS NULL AND subject IS NULL;

CREATE INDEX team_roles__account__idx ON team_roles (
  team DESC
);

CREATE INDEX team_roles__role__idx ON team_roles (
  role DESC
);

CREATE INDEX team_roles__subject__idx ON team_roles (
  subject DESC
);

CREATE INDEX team_roles__subject_type__idx ON team_roles (
  subject_type DESC
);

COMMIT;
