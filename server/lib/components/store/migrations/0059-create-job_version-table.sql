START TRANSACTION;

CREATE TABLE job_version
(
    id uuid PRIMARY KEY,
    job uuid NOT NULL,
    yaml text NOT NULL,
    created_by uuid NOT NULL,
    created_on timestamp with time zone NOT NULL,
    last_applied timestamp with time zone,

    CONSTRAINT job FOREIGN KEY (job)
        REFERENCES job (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX job_version_idx ON job_version (
  job
);

CREATE INDEX job_version_created_on ON job_version (
  job, created_on DESC
);

COMMIT;
