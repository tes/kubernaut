BEGIN;

CREATE MATERIALIZED VIEW entity_count__mvw (
  entity,
  owner,
  count
) AS

SELECT 'registry', '*', count(*)
FROM active_registry__vw
UNION
  SELECT 'namespace', '*', count(*)
  FROM active_namespace__vw
UNION
  SELECT 'account', '*', count(*)
  FROM active_account__vw
UNION
  SELECT 'service', '*', count(*)
  FROM active_service__vw
UNION
  SELECT 'release', '*', count(*)
  FROM active_release__vw
UNION
  SELECT 'deployment', '*', count(*)
  FROM active_deployment__vw
UNION
  SELECT 'service', sr.name AS owner, count(*)
  FROM active_service__vw s, registry sr
  WHERE s.registry = sr.id
  GROUP BY owner
UNION
  SELECT 'release', sr.name AS owner, count(*)
  FROM active_release__vw r, service s, registry sr
  WHERE r.service = s.id
    AND s.registry = sr.id
GROUP BY owner
UNION
  SELECT 'deployment', n.name AS owner, count(*)
  FROM active_deployment__vw d, namespace n
WHERE d.namespace = n.id
GROUP BY owner
;

COMMIT;
