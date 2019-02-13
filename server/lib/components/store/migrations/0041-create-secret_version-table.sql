START TRANSACTION;

CREATE TABLE secret_version
(
    id uuid NOT NULL,
    namespace uuid NOT NULL,
    service uuid NOT NULL,
    created_by uuid NOT NULL,
    created_on timestamp with time zone NOT NULL,
    deleted_on timestamp with time zone,
    deleted_by uuid,
    comment text NOT NULL,

    CONSTRAINT secret_version_pkey PRIMARY KEY (id),
    CONSTRAINT namespace FOREIGN KEY (namespace)
        REFERENCES namespace (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT service FOREIGN KEY (service)
        REFERENCES service (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT deletion_check CHECK (deleted_on IS NULL AND deleted_by IS NULL OR deleted_on IS NOT NULL AND deleted_by IS NOT NULL)
);

CREATE INDEX created_on ON secret_version (
  created_on DESC
);

CREATE INDEX fki_service ON secret_version (
  service
);

CREATE INDEX fki_namespace ON secret_version (
  namespace
);

CREATE INDEX service_namespace_secret_idx ON secret_version (
  service, namespace
);

COMMIT;
