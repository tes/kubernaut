START TRANSACTION;

CREATE TABLE cluster_ingress_class
(
  id uuid NOT NULL,
  cluster uuid NOT NULL,
  ingress_class uuid NOT NULL,
  created_by uuid NOT NULL,
  created_on timestamp with time zone NOT NULL,
  deleted_on timestamp with time zone,
  deleted_by uuid,

  CONSTRAINT cluster_ingress_class_pkey PRIMARY KEY (id),
  CONSTRAINT cluster FOREIGN KEY (cluster)
      REFERENCES cluster (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT ingress_class FOREIGN KEY (ingress_class)
      REFERENCES ingress_class (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT deletion_check CHECK (deleted_on IS NULL AND deleted_by IS NULL OR deleted_on IS NOT NULL AND deleted_by IS NOT NULL)
);


CREATE UNIQUE INDEX cluster_ingress_class_key__uniq ON cluster_ingress_class (
  cluster, ingress_class
) WHERE deleted_on IS NULL;

CREATE VIEW active_cluster_ingress_class__vw AS (
  SELECT cic.*
  FROM
    cluster_ingress_class cic
  WHERE cic.deleted_on IS NULL
);

COMMIT;
