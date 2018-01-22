START TRANSACTION;

CREATE TABLE namespace (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  cluster UUID NOT NULL REFERENCES cluster,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT namespace__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX namespace__name__cluster__uniq ON namespace (
  name DESC, cluster DESC
) WHERE deleted_on IS NULL;

CREATE INDEX namespace__name__idx ON namespace (
  name DESC
);

CREATE INDEX namespace__cluster__idx ON namespace (
  cluster DESC
);

CREATE INDEX namespace__created_on__idx ON namespace (
  created_on DESC
);

COMMIT;
