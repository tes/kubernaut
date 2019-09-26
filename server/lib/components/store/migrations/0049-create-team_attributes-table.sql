START TRANSACTION;

CREATE TABLE team_attribute
(
    team uuid NOT NULL,
    name text NOT NULL,
    value text NOT NULL,


    CONSTRAINT team FOREIGN KEY (team)
        REFERENCES team (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT team_name__uniq UNIQUE (team, name)
);

CREATE INDEX team_attribute__team_idx ON team_attribute (
  team
);

COMMIT;
