START TRANSACTION;

CREATE TABLE team
(
    id uuid PRIMARY KEY,
    name text NOT NULL,
    created_on TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID NOT NULL REFERENCES account,
    deleted_on TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES account,
    CONSTRAINT team__deletion__chk CHECK ((deleted_on IS NULL AND deleted_by IS NULL) OR (deleted_on IS NOT NULL AND deleted_by IS NOT NULL))

);

CREATE UNIQUE INDEX team__name__uniq ON team (
  name DESC
) WHERE deleted_on IS NULL;

COMMIT;
