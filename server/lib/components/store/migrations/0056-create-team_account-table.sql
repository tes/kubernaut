START TRANSACTION;

CREATE TABLE team_account (
  id UUID PRIMARY KEY,
  team UUID NOT NULL REFERENCES team ON DELETE CASCADE,
  account UUID NOT NULL REFERENCES account ON DELETE CASCADE,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT team_account__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX team_account__team_account__uniq ON team_account (
  team DESC, account DESC
) WHERE deleted_on IS NULL;

CREATE INDEX team_account__team__idx ON team_account (
  team DESC
);

CREATE INDEX team_account__account__idx ON team_account (
  account DESC
);

COMMIT;
