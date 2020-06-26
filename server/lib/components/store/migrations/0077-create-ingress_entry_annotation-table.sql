START TRANSACTION;

CREATE TABLE ingress_entry_annotation
(
  ingress_entry uuid NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,

  CONSTRAINT ingress_entry FOREIGN KEY (ingress_entry)
      REFERENCES ingress_entry (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE

);

CREATE UNIQUE INDEX ingress_entry_annotation__version__name__uniq ON ingress_entry_annotation (
  ingress_entry DESC, name DESC
);

COMMIT;
