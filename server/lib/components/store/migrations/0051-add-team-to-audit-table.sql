START TRANSACTION;

ALTER TABLE audit ADD COLUMN action_team uuid;
ALTER TABLE audit ADD CONSTRAINT action_team FOREIGN KEY (action_team)
    REFERENCES team (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

CREATE INDEX audit_action_team ON audit (
  action_team
);

COMMIT;
