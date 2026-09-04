/**
 * A replayable season. The harness takes this as a parameter so 2024 and 2025
 * can be added as soon as database backups are running again (issue #39) —
 * their ESPN coverage is already in the bucket.
 */
export interface Season {
  year: number;
  regularWeeks: number;
  postWeeks: number[];
  /**
   * The backup the fixture is built from. It has to be taken after the season
   * finished, so it contains that season's bets in full.
   */
  backupKey: string;
  asOfDates: { label: string; at: string }[];
}

/**
 * COVERAGE
 *
 * `recordToFile()` stopped writing 2023 scoreboards after 2023-10-27 and did
 * not write another until 2024-03, so between week 8 and the Super Bowl there
 * is nothing to replay: an as-of date in that window would be served the
 * October recording, in which those games are still STATUS_SCHEDULED. The two
 * as-of dates issue #49 asks for there — end of the regular season, and
 * playoffs week 1 — are therefore not in the list below.
 *
 * 2024 and 2025 have no such gap (roughly 1,500-2,000 recordings a month right
 * through both seasons), so both get all seven as-of dates as soon as there is
 * a database backup to pair them with — see issue #39.
 */
export const season2023: Season = {
  year: 2023,
  regularWeeks: 18,
  postWeeks: [1, 2, 3, 5],
  // The last backup that exists. Taken 2024-03-03, after Super Bowl LVIII
  // (2024-02-11), so the 2023 season is complete in it.
  backupKey: 'database_backup/2024-03-03.gz',
  asOfDates: [
    // Division and Super Bowl bets open, and hidden from other players.
    { label: 'before week 1 kickoff', at: '2023-09-07T12:00:00.000Z' },
    // Live scoring against STATUS_IN_PROGRESS / STATUS_HALFTIME: the chosen
    // snapshot has eight of week 1's games in progress.
    { label: 'week 1 mid-game', at: '2023-09-10T18:15:00.000Z' },
    // Steady state: doublers, underdog bonuses, the -1 for an un-placed bet.
    // This is the last in-season ESPN recording of 2023 (see COVERAGE below).
    { label: 'week 7 complete', at: '2023-10-27T06:00:00.000Z' },
    // #38. The clock is in Super Bowl week and the newest recording still has
    // the game STATUS_SCHEDULED. The snapshot shows 0 Super Bowl points for
    // everyone, which is right — but only by accident: `findSbWinner` never
    // asks whether the game was played, it returns the away team unless the
    // winner is 'home', and here that is ESPN's TBD placeholder (team id
    // "-2"), which nobody can have bet on. Fixing #38 must keep these zeroes.
    { label: 'super bowl week before kickoff', at: '2024-02-11T12:00:00.000Z' },
    // The first recording after the gap. Every game of 2023 is final in it.
    { label: 'after the super bowl', at: '2024-03-04T12:00:00.000Z' },
  ],
};
