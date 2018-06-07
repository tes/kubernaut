START TRANSACTION;

CREATE TABLE cluster (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  config TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT cluster__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX cluster__name__uniq ON cluster (
  name DESC
) WHERE deleted_on IS NULL;

CREATE INDEX cluster__created_on__idx ON cluster (
  created_on DESC
);

COMMIT;
