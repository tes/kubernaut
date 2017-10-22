START TRANSACTION;

CREATE TABLE profile_attribute (
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  profile TEXT REFERENCES profile ON DELETE CASCADE,
  UNIQUE (profile, name)
);

CREATE INDEX profile_attribute__profile__name__idx ON profile_attribute (
  profile, name
);

COMMIT;
