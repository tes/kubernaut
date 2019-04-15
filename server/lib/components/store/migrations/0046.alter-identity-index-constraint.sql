START TRANSACTION;
DROP INDEX IF EXISTS identity__name__bearer__uniq;

CREATE UNIQUE INDEX identity__account__provider__bearer__uniq ON identity (
  account, provider DESC
) WHERE deleted_on IS NULL AND type = 'bearer';

COMMIT;
