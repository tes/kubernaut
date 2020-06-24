START TRANSACTION;

CREATE TABLE cluster_ingress_host
(
  id uuid NOT NULL,
  cluster uuid NOT NULL,
  ingress_host_key uuid NOT NULL,
  value text NOT NULL,
  created_by uuid NOT NULL,
  created_on timestamp with time zone NOT NULL,
  deleted_on timestamp with time zone,
  deleted_by uuid,

  CONSTRAINT cluster_ingress_host_pkey PRIMARY KEY (id),
  CONSTRAINT cluster FOREIGN KEY (cluster)
      REFERENCES cluster (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT ingress_host_key FOREIGN KEY (ingress_host_key)
      REFERENCES ingress_host_key (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE CASCADE,
  CONSTRAINT deletion_check CHECK (deleted_on IS NULL AND deleted_by IS NULL OR deleted_on IS NOT NULL AND deleted_by IS NOT NULL)
);

CREATE UNIQUE INDEX cluster_ingress_host_key__uniq ON cluster_ingress_host (
  cluster, ingress_host_key
) WHERE deleted_on IS NULL;

CREATE VIEW active_cluster_ingress_host__vw AS (
  SELECT cih.*
  FROM
    cluster_ingress_host cih
  WHERE cih.deleted_on IS NULL
);

COMMIT;
