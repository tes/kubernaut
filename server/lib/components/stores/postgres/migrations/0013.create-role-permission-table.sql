START TRANSACTION;

CREATE TABLE role_permission (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL REFERENCES role,
  permission TEXT NOT NULL REFERENCES permission
);

CREATE UNIQUE INDEX role_permission__role__permission__uniq ON role_permission (
  role DESC, permission DESC
);

COMMIT;
