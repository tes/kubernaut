START TRANSACTION;

CREATE TABLE role_permission (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL REFERENCES role,
  permission TEXT NOT NULL REFERENCES permission,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT NOT NULL,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by TEXT,
  CONSTRAINT service__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX role_permission__role__permission__uniq ON role_permission (
  role DESC, permission DESC
) WHERE deleted_on IS NULL;

CREATE INDEX role_permission__role__idx ON role_permission (
  role DESC
);

COMMIT;
