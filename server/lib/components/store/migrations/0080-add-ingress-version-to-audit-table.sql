START TRANSACTION;

ALTER TABLE audit ADD COLUMN action_ingress_version uuid;
ALTER TABLE audit ADD CONSTRAINT action_ingress_version FOREIGN KEY (action_ingress_version)
    REFERENCES ingress_version (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

CREATE INDEX audit_action_ingress_version ON audit (
  action_ingress_version
);

COMMIT;
