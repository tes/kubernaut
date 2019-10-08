START TRANSACTION;

CREATE VIEW active_team_roles__vw AS (
  SELECT tr.*
  FROM
    team_roles tr,
    active_team__vw t
  WHERE tr.deleted_on IS NULL
    AND tr.team = t.id
);

COMMIT;
