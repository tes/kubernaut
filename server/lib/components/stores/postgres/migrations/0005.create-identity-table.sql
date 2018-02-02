START TRANSACTION;

CREATE TABLE identity (
  id UUID PRIMARY KEY,
  account UUID NOT NULL REFERENCES account ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT identity__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX identity__name__provider__type__uniq ON identity (
  name DESC, provider DESC, type DESC
) WHERE deleted_on IS NULL;

CREATE UNIQUE INDEX identity__name__bearer__uniq ON identity (
  provider DESC
) WHERE deleted_on IS NULL AND type = 'bearer';

COMMIT;
