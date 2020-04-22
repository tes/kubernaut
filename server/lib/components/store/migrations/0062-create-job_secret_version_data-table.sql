START TRANSACTION;

CREATE TABLE job_secret_version_data
(
    id uuid NOT NULL,
    job_version uuid NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    editor character varying(32) NOT NULL DEFAULT 'json'::character varying,

    CONSTRAINT job_secret_version_data_pkey PRIMARY KEY (id),
    CONSTRAINT key_per_job_version UNIQUE (job_version, key),
    CONSTRAINT job_version_key_unique UNIQUE (job_version, key),
    CONSTRAINT job_version FOREIGN KEY (job_version)
        REFERENCES job_version (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT editor_check CHECK (editor IN ('json', 'simple', 'plain_text'))
);

CREATE INDEX job_secret_version ON job_secret_version_data (
  job_version
);

COMMIT;
