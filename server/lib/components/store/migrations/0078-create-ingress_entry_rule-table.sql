START TRANSACTION;

CREATE TABLE ingress_entry_rule
(
  id uuid NOT NULL,
  ingress_entry uuid NOT NULL,
  path TEXT NOT NULL,
  port TEXT NOT NULL,
  ingress_host_key uuid,
  custom_host TEXT,

  CONSTRAINT ingress_entry_rule_pkey PRIMARY KEY (id),
  CONSTRAINT ingress_entry FOREIGN KEY (ingress_entry)
      REFERENCES ingress_entry (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT ingress_host_key FOREIGN KEY (ingress_host_key)
      REFERENCES ingress_host_key (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT host_check CHECK (
    (ingress_host_key IS NOT NULL)
    OR
    (custom_host IS NOT NULL)
  )

);

CREATE INDEX ingress_entry_rule_entry ON ingress_entry_rule (
  ingress_entry DESC
);

COMMIT;
