START TRANSACTION;

CREATE TABLE deployment (
  id TEXT PRIMARY KEY,
  release TEXT NOT NULL REFERENCES release ON DELETE CASCADE,
  context TEXT NOT NULL,
  manifest_yaml TEXT NOT NULL,
  manifest_json JSONB NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT,
  CONSTRAINT deployment__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE INDEX deployment__release__idx ON deployment (
  release DESC
);

CREATE INDEX deployment__created_on__idx ON deployment (
  created_on DESC
);

COMMIT;
