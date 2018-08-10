START TRANSACTION;

CREATE TABLE service_namespace (
  id UUID PRIMARY KEY,
  namespace UUID NOT NULL REFERENCES namespace ON DELETE CASCADE,
  service UUID NOT NULL REFERENCES service ON DELETE CASCADE,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT service_namespace__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX service_namespace__namespace__service__idx ON service_namespace (
  namespace ASC, service ASC
) where deleted_on IS NULL;

CREATE INDEX service_namespace__namespace__idx ON service_namespace (
  namespace ASC
);

CREATE INDEX service_namespace__service__idx ON service_namespace (
  service ASC
);

COMMIT;
