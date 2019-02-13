START TRANSACTION;

CREATE TABLE secret_version_data
(
    id uuid NOT NULL,
    version uuid NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    editor character varying(32) NOT NULL DEFAULT 'json'::character varying,

    CONSTRAINT secret_version_data_pkey PRIMARY KEY (id),
    CONSTRAINT key_per_version UNIQUE (version, key),
    CONSTRAINT version_key_unique UNIQUE (version, key),
    CONSTRAINT version FOREIGN KEY (version)
        REFERENCES secret_version (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT editor_check CHECK (editor IN ('json', 'simple'))
);

CREATE INDEX version ON secret_version_data (
  version
);

COMMIT;
