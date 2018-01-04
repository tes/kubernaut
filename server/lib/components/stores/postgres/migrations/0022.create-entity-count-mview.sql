BEGIN;

CREATE MATERIALIZED VIEW entity_count__mvw (
  entity,
  namespace,
  count
) AS

SELECT
  'namespace', '*', count(*)
FROM
  active_namespace__vw n
UNION SELECT
  'account', '*', count(*)
FROM
  active_account__vw a
UNION SELECT
  'service', '*', count(*)
FROM
  active_service__vw a UNION
SELECT
  'release', '*', count(*)
FROM
  active_release__vw a
UNION
SELECT
  'deployment', '*', count(*)
FROM
  active_deployment__vw a
UNION SELECT
  'service', n.name, count(*)
FROM
  active_service__vw s, namespace n
WHERE
  s.namespace = n.id
GROUP BY
  n.name
UNION SELECT
  'release', n.name, count(*)
FROM
  active_release__vw r, service s, namespace n
WHERE
  r.service = s.id AND s.namespace = n.id
GROUP BY
  n.name
UNION SELECT
  'deployment', n.name, count(*)
FROM
  active_deployment__vw d, release r, service s, namespace n
WHERE
  d.release = r.id AND r.service = s.id AND s.namespace = n.id
GROUP BY
  n.name
;

COMMIT;
