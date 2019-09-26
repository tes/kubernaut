START TRANSACTION;

CREATE TABLE team_service
(
    team uuid NOT NULL,
    service uuid NOT NULL,

    CONSTRAINT team FOREIGN KEY (team)
        REFERENCES team (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT service FOREIGN KEY (service)
        REFERENCES service (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,

    CONSTRAINT team_service__uniq UNIQUE (team, service)
);

CREATE INDEX team_service__team_idx ON team_service (
  team
);

CREATE INDEX team_service__service_idx ON team_service (
  service
);

COMMIT;
