-- Anonymises a production database backup so it can be used as a test fixture.
--
-- The backup holds real people: names, email addresses, scrypt password hashes
-- and salts, and live password-reset and verification tokens. None of that may
-- reach a snapshot, a log line, or the repository. This runs immediately after
-- the dump's data is loaded and before anything else reads the database.
--
-- Everything the golden master actually asserts on — bet, "betDoubler",
-- "divisionBet", "superbowlBet", league, member, admin, game, week, team,
-- division, bye — is deliberately left exactly as it is. Those rows are the
-- point of the fixture and identify nobody once names and emails are gone.

BEGIN;

-- Live tokens. There is no reason to keep any of them.
TRUNCATE reset, verify;

-- Stable pseudonyms: numbered by user id, so the same backup always produces
-- the same "Player n" and the snapshots stay comparable across runs.
--
-- The password/salt pair is scrypt('golden-master-password', 16 zero bytes)
-- with the parameters used by UserDataService, so login can be exercised. It
-- is asserted against a freshly computed hash in test/golden/seed.ts, which
-- fails the suite if the two ever drift apart.
WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM "user"
)
UPDATE "user" AS u
SET
  name = 'Player ' || numbered.n,
  email = 'player-' || numbered.n || '@example.invalid',
  salt = '00000000000000000000000000000000',
  password = '65f61875e87fd17dce3508f51fed9b3fa55cc0f945f77bd9a92e7c5d1eecec43'
             '4ff51f15bb9e4995a4ccd4e9853d7da36676798d54061ff6632ac8ad3ad2d975'
             '54384fba700d61f5e55f39062c7e70858d901e102eff0cf518856b986737934f'
             'b12c4df2ac502ba0680395981d419753a8a9b5a594b6b353955fd085546fa0f2',
  settings = '{}'::jsonb
FROM numbered
WHERE u.id = numbered.id;

COMMIT;
