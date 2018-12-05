START TRANSACTION;

UPDATE role SET priority = 100 WHERE name = 'observer';
UPDATE role SET priority = 200 WHERE name = 'developer';
UPDATE role SET priority = 300 WHERE name = 'maintainer';
UPDATE role SET priority = 400 WHERE name = 'admin';

COMMIT;
