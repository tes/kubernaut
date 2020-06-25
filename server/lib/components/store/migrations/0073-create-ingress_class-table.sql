START TRANSACTION;

CREATE TABLE ingress_class
(
  id uuid NOT NULL,
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_on timestamp with time zone NOT NULL,
  deleted_on timestamp with time zone,
  deleted_by uuid,

  CONSTRAINT ingress_class_pkey PRIMARY KEY (id),
  CONSTRAINT deletion_check CHECK (deleted_on IS NULL AND deleted_by IS NULL OR deleted_on IS NOT NULL AND deleted_by IS NOT NULL)
);

CREATE UNIQUE INDEX ingress_class_name__uniq ON ingress_class (
  name DESC
) WHERE deleted_on IS NULL;

CREATE VIEW active_ingress_class__vw AS (
  SELECT ic.*
  FROM
    ingress_class ic
  WHERE ic.deleted_on IS NULL
);

COMMIT;
