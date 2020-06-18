START TRANSACTION;

CREATE TABLE cluster_ingress_variable
(
  id uuid NOT NULL,
  cluster uuid NOT NULL,
  ingress_variable_key uuid NOT NULL,
  value text NOT NULL,
  created_by uuid NOT NULL,
  created_on timestamp with time zone NOT NULL,
  deleted_on timestamp with time zone,
  deleted_by uuid,

  CONSTRAINT cluster_ingress_variable_pkey PRIMARY KEY (id),
  CONSTRAINT cluster FOREIGN KEY (cluster)
      REFERENCES cluster (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT ingress_variable_key FOREIGN KEY (ingress_variable_key)
      REFERENCES ingress_variable_key (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT deletion_check CHECK (deleted_on IS NULL AND deleted_by IS NULL OR deleted_on IS NOT NULL AND deleted_by IS NOT NULL)
);

CREATE VIEW active_cluster_ingress_variable__vw AS (
  SELECT civ.*
  FROM
    cluster_ingress_variable civ
  WHERE civ.deleted_on IS NULL
);

COMMIT;
