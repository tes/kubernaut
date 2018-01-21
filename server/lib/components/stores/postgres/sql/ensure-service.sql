SELECT
  ensure_service(
   $1,
   (SELECT id FROM active_registry__vw WHERE name = $2),
   $3,
   $4
 ) AS id
;
