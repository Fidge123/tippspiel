export interface Season {
  year: number;
  regularWeeks: number;
  postWeeks: number[];
  /** Must be a backup taken after the season finished. */
  backupKey: string;
  asOfDates: { label: string; at: string }[];
}

// `recordToFile()` wrote no 2023 scoreboard between 2023-10-27 and 2024-03, so
// the end of the regular season and the playoff weeks cannot be replayed: an
// as-of date in that window is served the October recording, in which those
// games are still STATUS_SCHEDULED. 2024 and 2025 have no such gap and take
// all seven as-of dates from issue #49 once backups exist again (#39).
export const season2023: Season = {
  year: 2023,
  regularWeeks: 18,
  postWeeks: [1, 2, 3, 5],
  backupKey: 'database_backup/2024-03-03.gz',
  asOfDates: [
    { label: 'before week 1 kickoff', at: '2023-09-07T12:00:00.000Z' },
    { label: 'week 1 mid-game', at: '2023-09-10T18:15:00.000Z' },
    // The last in-season recording of 2023.
    { label: 'week 7 complete', at: '2023-10-27T06:00:00.000Z' },
    // #38. The zeroes here are right by accident: `findSbWinner` never asks
    // whether the game was played, and the away team it falls back to is
    // ESPN's TBD placeholder, which nobody bet on. A fix must keep them zero.
    { label: 'super bowl week before kickoff', at: '2024-02-11T12:00:00.000Z' },
    { label: 'after the super bowl', at: '2024-03-04T12:00:00.000Z' },
  ],
};
