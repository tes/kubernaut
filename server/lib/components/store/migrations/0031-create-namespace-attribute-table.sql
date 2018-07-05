START TRANSACTION;

CREATE TABLE namespace_attribute (
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  namespace UUID REFERENCES namespace ON DELETE CASCADE,
  CONSTRAINT namespace_attribute__namespace__name__uniq UNIQUE (namespace, name)
);

CREATE UNIQUE INDEX namespace_attribute__namespace__name__idx ON namespace_attribute (
  namespace DESC, name DESC
);

COMMIT;
