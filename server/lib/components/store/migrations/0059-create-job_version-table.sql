START TRANSACTION;

CREATE TABLE job_version
(
    id uuid NOT NULL,
    version uuid NOT NULL,
    job uuid NOT NULL,
    yaml text NOT NULL,
    created_by uuid NOT NULL,
    created_on timestamp with time zone NOT NULL,

    CONSTRAINT job_version_pkey PRIMARY KEY (id),
    CONSTRAINT job FOREIGN KEY (job)
        REFERENCES job (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX job_version_idx ON job_version (
  job, version
);

CREATE INDEX job_version_created_on ON job_version (
  created_on DESC
);

COMMIT;
