START TRANSACTION;

CREATE VIEW active_job_version__vw AS (
  SELECT jv.*
  FROM
    job_version jv
);

COMMIT;
