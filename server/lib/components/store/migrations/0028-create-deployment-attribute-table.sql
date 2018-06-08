START TRANSACTION;

CREATE TABLE deployment_attribute (
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  deployment UUID REFERENCES deployment ON DELETE CASCADE,
  CONSTRAINT deployment_attribute__deployment__name__uniq UNIQUE (deployment, name)
);

CREATE UNIQUE INDEX deployment_attribute__deployment__name__idx ON deployment_attribute (
  deployment DESC, name DESC
);

COMMIT;
