START TRANSACTION;

CREATE TABLE service_namespace_attribute
(
    namespace uuid NOT NULL,
    service uuid NOT NULL,
    name text NOT NULL,
    value text NOT NULL,


    CONSTRAINT namespace FOREIGN KEY (namespace)
        REFERENCES namespace (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT service FOREIGN KEY (service)
        REFERENCES service (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT namespace_service_name__uniq UNIQUE (namespace, service, name)
);

CREATE INDEX namespace_service_attribute__namespace_service_idx ON service_namespace_attribute (
  namespace, service
);

COMMIT;
