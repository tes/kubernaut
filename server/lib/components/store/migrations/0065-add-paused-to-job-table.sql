START TRANSACTION;

ALTER TABLE job ADD COLUMN paused boolean;

CREATE OR REPLACE VIEW active_job__vw AS (
  SELECT j.*
  FROM
    job j
  WHERE j.deleted_on IS NULL
);

COMMIT;
