START TRANSACTION;

CREATE TABLE role_permission (
  id UUID PRIMARY KEY,
  role UUID NOT NULL REFERENCES role ON DELETE CASCADE,
  permission UUID NOT NULL REFERENCES permission ON DELETE CASCADE
);

CREATE UNIQUE INDEX role_permission__role__permission__uniq ON role_permission (
  role DESC, permission DESC
);

COMMIT;
