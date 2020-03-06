START TRANSACTION;

CREATE TABLE job
(
    id uuid NOT NULL,
    name text NOT NULL,
    namespace uuid NOT NULL,
    created_by uuid NOT NULL,
    created_on timestamp with time zone NOT NULL,
    deleted_on timestamp with time zone,
    deleted_by uuid,

    CONSTRAINT job_pkey PRIMARY KEY (id),
    CONSTRAINT namespace FOREIGN KEY (namespace)
        REFERENCES namespace (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT deletion_check CHECK (deleted_on IS NULL AND deleted_by IS NULL OR deleted_on IS NOT NULL AND deleted_by IS NOT NULL)
);

CREATE INDEX job_created_on ON job (
  created_on DESC
);

CREATE INDEX job_namespace ON job (
  namespace
);

COMMIT;
