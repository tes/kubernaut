START TRANSACTION;

ALTER TABLE audit ADD COLUMN action_job uuid;
ALTER TABLE audit ADD COLUMN action_job_version uuid;
ALTER TABLE audit ADD CONSTRAINT action_job FOREIGN KEY (action_job)
    REFERENCES job (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
ALTER TABLE audit ADD CONSTRAINT action_job_version FOREIGN KEY (action_job_version)
    REFERENCES job_version (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

CREATE INDEX audit_action_job ON audit (
  action_job
);

CREATE INDEX audit_action_job_version ON audit (
  action_job_version
);

COMMIT;
