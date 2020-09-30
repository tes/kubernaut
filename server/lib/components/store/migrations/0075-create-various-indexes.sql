START TRANSACTION;

CREATE INDEX IF NOT EXISTS deployment__deleted_on__idx
    ON deployment
    (deleted_on ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS deployment__deleted_on_exit_codes__idx
    ON deployment
    (deleted_on ASC NULLS FIRST, apply_exit_code ASC NULLS LAST, rollout_status_exit_code ASC NULLS LAST);


CREATE INDEX IF NOT EXISTS release__deleted_on__idx
    ON release
    (deleted_on ASC NULLS FIRST);

CREATE INDEX IF NOT EXISTS service__deleted_on__idx
    ON service
    (deleted_on ASC NULLS LAST);

COMMIT;
