START TRANSACTION;

CREATE VIEW active_team_account__vw AS (
  SELECT ta.*
  FROM
    team_account ta,
    active_team__vw t,
    active_account__vw a
  WHERE ta.deleted_on IS NULL
    AND ta.team = t.id
    AND ta.account  = a.id
);

COMMIT;
