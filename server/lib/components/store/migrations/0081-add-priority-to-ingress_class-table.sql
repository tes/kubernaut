START TRANSACTION;

ALTER TABLE ingress_class ADD COLUMN priority SMALLINT;

DROP VIEW IF EXISTS active_ingress_class__vw;
CREATE VIEW active_ingress_class__vw AS (
  SELECT ic.*
  FROM
    ingress_class ic
  WHERE ic.deleted_on IS NULL
);
COMMIT;
