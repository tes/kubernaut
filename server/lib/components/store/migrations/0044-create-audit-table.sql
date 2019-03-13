START TRANSACTION;

CREATE TABLE audit
(
    id uuid NOT NULL,
    account uuid NOT NULL,
    action text NOT NULL,
    created_on timestamp with time zone NOT NULL,
    action_account uuid,
    action_cluster uuid,
    action_deployment uuid,
    action_namespace uuid,
    action_release uuid,
    action_service uuid,
    action_secret_version uuid,
    action_registry uuid,

    CONSTRAINT audit_pkey PRIMARY KEY (id),
    CONSTRAINT account FOREIGN KEY (account)
        REFERENCES account (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT action_account FOREIGN KEY (action_account)
        REFERENCES account (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT action_cluster FOREIGN KEY (action_cluster)
        REFERENCES cluster (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT action_deployment FOREIGN KEY (action_deployment)
        REFERENCES deployment (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT action_namespace FOREIGN KEY (action_namespace)
        REFERENCES namespace (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT action_release FOREIGN KEY (action_release)
        REFERENCES release (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT action_service FOREIGN KEY (action_service)
        REFERENCES service (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT action_secret_version FOREIGN KEY (action_secret_version)
        REFERENCES secret_version (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT action_registry FOREIGN KEY (action_registry)
        REFERENCES registry (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE

);

CREATE INDEX audit_account ON audit (
  account
);

CREATE INDEX audit_action ON audit USING GIN (to_tsvector('english', action));

CREATE INDEX audit_created_on ON audit (
  created_on DESC
);

CREATE INDEX audit_created_on_asc ON audit (
  created_on ASC
);

CREATE INDEX audit_action_account ON audit (
  action_account
);

CREATE INDEX audit_action_cluster ON audit (
  action_cluster
);

CREATE INDEX audit_action_deployment ON audit (
  action_deployment
);

CREATE INDEX audit_action_namespace ON audit (
  action_namespace
);

CREATE INDEX audit_action_release ON audit (
  action_release
);

CREATE INDEX audit_action_service ON audit (
  action_service
);

CREATE INDEX audit_action_secret_version ON audit (
  action_secret_version
);

CREATE INDEX audit_action_registry ON audit (
  action_registry
);

COMMIT;
