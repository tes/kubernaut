START TRANSACTION;

DROP VIEW active_deployment__vw;
DROP VIEW active_namespace__vw;

ALTER TABLE namespace DROP COLUMN context;

CREATE OR REPLACE VIEW active_namespace__vw AS
  SELECT
    n.*
  FROM
    namespace n
  WHERE
    n.deleted_on IS NULL
  ORDER BY
    n.name ASC
;

CREATE OR REPLACE VIEW active_deployment__vw AS
SELECT
  d.*
FROM
  deployment d,
  active_namespace__vw n,
  active_release__vw r
WHERE
  d.deleted_on IS NULL AND
  d.namespace = n.id AND
  d.release = r.id
ORDER BY
  d.created_on DESC,
  d.id DESC
;

COMMIT;
