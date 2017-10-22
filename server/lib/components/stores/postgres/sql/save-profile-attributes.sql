INSERT INTO
  profile_attribute
SELECT
  *
FROM
  json_populate_recordset(null::profile_attribute, $1)
;
