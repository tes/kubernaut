START TRANSACTION;

CREATE TABLE release (
  id UUID PRIMARY KEY,
  service UUID REFERENCES service ON DELETE CASCADE,
  version TEXT NOT NULL,
  template UUID REFERENCES release_template ON DELETE CASCADE,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT release__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX release__service__version__uniq ON release (
  service DESC, version DESC
) WHERE deleted_on IS NULL;

CREATE INDEX release__service__idx ON release (
  service DESC
);

CREATE INDEX release__template__idx ON release (
  template DESC
);

CREATE INDEX release__created_on__idx ON release (
  created_on DESC
);

COMMIT;
