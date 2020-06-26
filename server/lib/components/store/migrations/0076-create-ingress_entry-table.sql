START TRANSACTION;

CREATE TABLE ingress_entry
(
  id uuid NOT NULL,
  name TEXT NOT NULL,
  ingress_version uuid NOT NULL,
  ingress_class uuid NOT NULL,

  CONSTRAINT ingress_entry_pkey PRIMARY KEY (id),
  CONSTRAINT ingress_version FOREIGN KEY (ingress_version)
      REFERENCES ingress_version (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT ingress_class FOREIGN KEY (ingress_class)
      REFERENCES ingress_class (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE

);

CREATE INDEX ingress_entry_version ON ingress_entry (
  ingress_version DESC
);

CREATE UNIQUE INDEX ingress_entry_name_version__uniq ON ingress_entry (
  ingress_version, name
);

COMMIT;
