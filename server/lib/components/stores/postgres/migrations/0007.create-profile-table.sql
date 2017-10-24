START TRANSACTION;

CREATE TABLE profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT,
  CONSTRAINT profile__name__version__uniq UNIQUE (name, version),
  CONSTRAINT profile__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE INDEX profile__created_on__id__idx on profile (
  created_on DESC, id DESC
);

COMMIT;
