START TRANSACTION;

CREATE MATERIALIZED VIEW active_release__mv AS
SELECT
  r.id,
  s.id AS service_id,
  s.name AS service_name,
  r.version,
  r.template,
  r.created_on,
  r.created_by
FROM
  release r, service s
WHERE
  r.deleted_on IS NULL AND
  s.deleted_on IS NULL AND
  r.service = s.id
ORDER BY
  r.created_on DESC,
  r.id DESC
;

CREATE UNIQUE INDEX active_release__mv__id__uniq ON active_release__mv (
  id
);

CREATE INDEX active_release__mv__name__idx ON active_release__mv (
  service_name
);

CREATE INDEX active_release__mv__created_on__id__idx ON active_release__mv (
  created_on DESC, id DESC
);

CREATE refresh_active_release__mv__trig()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY active_release__mv;
  RETURN NULL;
END;
$$;

COMMIT;
