START TRANSACTION;

ALTER TABLE cluster ADD COLUMN context text;

CREATE OR REPLACE VIEW active_cluster__vw AS (
  SELECT c.*
  FROM
    cluster c
  WHERE c.deleted_on IS NULL
  ORDER BY
    c.name ASC
);

COMMIT;
