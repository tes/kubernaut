SELECT
  pa.name,
  pa.value,
  pa.profile
FROM
  profile_attribute pa
WHERE
  pa.profile = $1
;
