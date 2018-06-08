START TRANSACTION;

CREATE TABLE deployment (
  id UUID PRIMARY KEY,
  release UUID NOT NULL REFERENCES release ON DELETE CASCADE,
  namespace UUID NOT NULL,
  manifest_yaml TEXT NOT NULL,
  manifest_json JSONB NOT NULL,
  apply_exit_code INTEGER,
  rollout_status_exit_code INTEGER,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT deployment__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE INDEX deployment__namespace__idx ON deployment (
  namespace DESC
);

CREATE INDEX deployment__release__idx ON deployment (
  release DESC
);

CREATE INDEX deployment__created_on__idx ON deployment (
  created_on DESC
);

COMMIT;
