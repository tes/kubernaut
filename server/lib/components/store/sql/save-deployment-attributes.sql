INSERT INTO
  deployment_attribute
SELECT
  *
FROM
  json_populate_recordset(null::deployment_attribute, $1)
;
