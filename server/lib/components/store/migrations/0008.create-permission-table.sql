START TRANSACTION;

CREATE TABLE permission (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE UNIQUE INDEX permission__name__uniq ON permission (
  name DESC
);

COMMIT;
