START TRANSACTION;

CREATE TABLE ingress_version
(
  id uuid NOT NULL,
  service uuid NOT NULL,
  comment TEXT NOT NULL,
  created_by uuid NOT NULL,
  created_on timestamp with time zone NOT NULL,
  deleted_on timestamp with time zone,
  deleted_by uuid,

  CONSTRAINT ingress_version_pkey PRIMARY KEY (id),
  CONSTRAINT service FOREIGN KEY (service)
      REFERENCES service (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT deletion_check CHECK (deleted_on IS NULL AND deleted_by IS NULL OR deleted_on IS NOT NULL AND deleted_by IS NOT NULL)
);

CREATE INDEX ingress_version_created_on ON ingress_version (
  service, created_on DESC
);

CREATE INDEX ingress_version_service ON ingress_version (
  service
);

CREATE VIEW active_ingress_version__vw AS (
  SELECT iv.*
  FROM
    ingress_version iv
  WHERE iv.deleted_on IS NULL
);

COMMIT;
