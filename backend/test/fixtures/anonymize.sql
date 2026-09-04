-- Runs before any other reader touches the seeded database.
-- test/replay/seed.ts fails the suite if this left anything identifying behind.

BEGIN;

TRUNCATE reset, verify;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "user"
)
UPDATE "user" AS u
SET
  name = 'Player ' || numbered.n,
  email = 'player-' || numbered.n || '@example.invalid',
  salt = '00000000000000000000000000000000',
  -- scrypt(TEST_PASSWORD, salt) with UserDataService's parameters.
  -- Must stay in step with TEST_PASSWORD in test/replay/seed.ts.
  password = 'c9bccd8cac9db122f8ff459047e84bb84752effff5d088f59179d1ee22856fd1'
             '23a7b24e2c8144ddc094efcb6a7638f4157738f05c6cafd92de2f5927b5fbf5b'
             'fc287c5c4fef9fc0250fda49e10984fd82da9f70a24c467a90662873a615e672'
             '8e7d370b71fb881ca906004528747259ade8d9f6679488e965c7f081e8bb5429',
  settings = '{}'::jsonb
FROM numbered
WHERE u.id = numbered.id;

COMMIT;
