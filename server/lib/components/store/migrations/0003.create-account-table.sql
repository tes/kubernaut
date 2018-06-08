START TRANSACTION;

CREATE TABLE account (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar TEXT,
  is_root BOOLEAN NOT NULL DEFAULT false,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES account,
  deleted_on TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES account,
  CONSTRAINT account__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE INDEX account__display_name__idx ON account (
  display_name DESC
);

CREATE INDEX account__is_root__uniq ON account (
  is_root DESC
) WHERE is_root = true;

CREATE INDEX account__created_on__idx ON account (
  created_on DESC
);

COMMIT;
