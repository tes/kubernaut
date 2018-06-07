START TRANSACTION;

CREATE TABLE registry (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT registry__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX registry__name__uniq ON registry (
  name ASC
) WHERE deleted_on IS NULL;

COMMIT;
