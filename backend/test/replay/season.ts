export interface Season {
  year: number;
  regularWeeks: number;
  postWeeks: number[];
  /** Must be a backup taken after the season finished. */
  backupKey: string;
  /** Weeks the snapshot spells out game by game; the rest keep only a subtotal. */
  detailWeeks: string[];
  asOfDates: { label: string; at: string }[];
}

// No 2023 scoreboard was recorded between 2023-10-27 and 2024-03.
// An as-of date in that window is served the October recording, in which the
// later games are still STATUS_SCHEDULED.
export const season2023: Season = {
  year: 2023,
  regularWeeks: 18,
  postWeeks: [1, 2, 3, 5],
  backupKey: 'database_backup/2024-03-03.gz',
  // The regular weeks are structurally alike, with no ties all season, the same
  // five pointDiff values and doublers and un-placed bets throughout.
  // The playoff weeks differ, so the first and the last are kept in full.
  detailWeeks: ['2023-2-1', '2023-3-1', '2023-3-5'],
  asOfDates: [
    { label: 'before week 1 kickoff', at: '2023-09-07T12:00:00.000Z' },
    { label: 'week 1 mid-game', at: '2023-09-10T18:15:00.000Z' },
    // The last in-season recording of 2023.
    { label: 'week 7 complete', at: '2023-10-27T06:00:00.000Z' },
    // The zeroes here are right by accident, because findSbWinner returns the
    // away team without checking that the game was played and that team is
    // ESPN's TBD placeholder. Issue #38 must keep them zero.
    { label: 'super bowl week before kickoff', at: '2024-02-11T12:00:00.000Z' },
    { label: 'after the super bowl', at: '2024-03-04T12:00:00.000Z' },
  ],
};
