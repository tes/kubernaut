START TRANSACTION;

CREATE TABLE release_attribute (
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  release TEXT REFERENCES release ON DELETE CASCADE,
  CONSTRAINT release_attribute__release__name__uniq UNIQUE (release, name)
);

CREATE INDEX release_attribute__release__name__idx ON release_attribute (
  release, name
);

COMMIT;
