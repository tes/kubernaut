START TRANSACTION;

CREATE TABLE role (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE UNIQUE INDEX role__name__uniq ON role (
  name DESC
);

COMMIT;
