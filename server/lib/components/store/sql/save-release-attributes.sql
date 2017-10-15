INSERT INTO
  release_attribute
SELECT
  *
FROM
  json_populate_recordset(null::release_attribute, $1)
;
