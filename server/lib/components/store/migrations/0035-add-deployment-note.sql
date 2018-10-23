START TRANSACTION;

ALTER TABLE deployment ADD COLUMN note text;

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
