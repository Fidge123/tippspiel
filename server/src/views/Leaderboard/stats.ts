import type { LeaderboardEntry } from '../../leaderboard/build';

export type Bet = LeaderboardEntry['bets'][number];

export const won = (bet: Bet) => bet.points > 0;
export const lost = (bet: Bet) => bet.points < 0;
export const tied = (bet: Bet) => bet.points === 0;

/** "3-1" or "3-1-2" — ties are only shown when there are any. */
export function record(bets: Bet[]): string {
  const ties = bets.filter(tied).length;
  return `${bets.filter(won).length}-${bets.filter(lost).length}${
    ties > 0 ? `-${ties}` : ''
  }`;
}

export function percentages(bets: Bet[]): string {
  if (!bets.length) {
    return '-';
  }
  const share = (fn: (bet: Bet) => boolean) =>
    `${((bets.filter(fn).length / bets.length) * 100).toFixed(1)}%`;
  const ties = bets.filter(tied).length;

  return `${share(won)}-${share(lost)}${ties > 0 ? `-${share(tied)}` : ''}`;
}

export function averageStake(bets: Bet[]): number {
  if (!bets.length) {
    return 0;
  }
  const total = bets.reduce((sum, bet) => sum + (bet.bet?.pointDiff ?? 0), 0);
  return Math.round((10 * total) / bets.length) / 10;
}

export function totalPoints(bets: Bet[]): number {
  return bets.reduce((sum, bet) => sum + bet.points, 0);
}

export function count(bets: Bet[], fn: (bet: Bet) => boolean): number {
  return bets.reduce((sum, bet) => (fn(bet) ? sum + 1 : sum), 0);
}
