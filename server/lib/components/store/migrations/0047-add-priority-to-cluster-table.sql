START TRANSACTION;

ALTER TABLE cluster ADD COLUMN PRIORITY SMALLINT;

DROP VIEW IF EXISTS active_cluster__vw;
CREATE VIEW active_cluster__vw AS
SELECT
  c.*
FROM
  cluster c
WHERE
  c.deleted_on IS NULL
ORDER BY
  c.name ASC
;

COMMIT;
