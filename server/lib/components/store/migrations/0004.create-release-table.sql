START TRANSACTION;

CREATE TABLE release (
  id TEXT PRIMARY KEY,
  service TEXT REFERENCES service ON DELETE CASCADE,
  version TEXT NOT NULL,
  template TEXT REFERENCES release_template ON DELETE CASCADE,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT,
  UNIQUE (service, version),
  CONSTRAINT release_deletion CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE INDEX release__deleted_on__created_on__id__idx on release (
  COALESCE(deleted_on, created_on), id
);

CREATE INDEX release__deleted_on__created_on__service__idx on release (
  COALESCE(deleted_on, created_on), service
);

COMMIT;
