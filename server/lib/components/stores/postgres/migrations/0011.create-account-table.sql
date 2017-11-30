START TRANSACTION;

CREATE TABLE account (
  id TEXT PRIMARY KEY,
  identity TEXT NOT NULL,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT,
  CONSTRAINT account__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX account__identity__provider__uniq ON account (
  identity DESC, provider DESC
) WHERE deleted_on IS NULL;

CREATE INDEX account__display_name__idx ON account (
  display_name DESC
);

CREATE INDEX account__created_on__idx ON account (
  created_on DESC
);

COMMIT;
