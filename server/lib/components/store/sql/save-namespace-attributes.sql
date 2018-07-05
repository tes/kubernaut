INSERT INTO
  namespace_attribute
SELECT
  *
FROM
  json_populate_recordset(null::namespace_attribute, $1)
;
