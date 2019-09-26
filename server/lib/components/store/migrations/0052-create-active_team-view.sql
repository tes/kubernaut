START TRANSACTION;

CREATE VIEW active_team__vw AS (
  SELECT t.*
  FROM
    team t
  WHERE t.deleted_on IS NULL
);

COMMIT;
