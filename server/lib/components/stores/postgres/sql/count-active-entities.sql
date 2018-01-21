SELECT
  count
FROM
  entity_count__mvw
WHERE entity = $1
  AND owner = '*'
;
