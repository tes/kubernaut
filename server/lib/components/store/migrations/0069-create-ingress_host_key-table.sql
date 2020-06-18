START TRANSACTION;

CREATE TABLE ingress_host_key
(
  id uuid NOT NULL,
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_on timestamp with time zone NOT NULL,
  deleted_on timestamp with time zone,
  deleted_by uuid,

  CONSTRAINT ingress_host_key_pkey PRIMARY KEY (id),
  CONSTRAINT deletion_check CHECK (deleted_on IS NULL AND deleted_by IS NULL OR deleted_on IS NOT NULL AND deleted_by IS NOT NULL)
);

CREATE VIEW active_ingress_host_key__vw AS (
  SELECT ihk.*
  FROM
    ingress_host_key ihk
  WHERE ihk.deleted_on IS NULL
);

COMMIT;
