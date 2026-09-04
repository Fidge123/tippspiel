/**
 * Pure scoring rules.
 *
 * This module deliberately contains no decorators, no Nest imports and no
 * TypeORM entities: the arithmetic that decides everybody's points has to be
 * callable — and testable — without a database. The leaderboard controller
 * maps entities onto these plain shapes.
 */

export type Winner = 'home' | 'away';

export interface Bet {
  winner: string;
  pointDiff: number;
}

export interface Team {
  id: string;
  playoffSeed?: number | null;
}

export interface DivisionBet {
  first?: Team | null;
  second?: Team | null;
  third?: Team | null;
  fourth?: Team | null;
}

export interface GamePointsInput {
  homeScore: number;
  awayScore: number;
  /** The user's bet, or undefined if they did not bet on this game. */
  bet?: Bet;
  /** Every bet placed on the game, used for the underdog bonus. */
  allBets: { winner: string }[];
  /** Whether the user spent a doubler on this game. */
  doubled: boolean;
}

/**
 * The underdog bonus: awarded when the picked side is at most a third of the
 * field. Returns false for a missing winner (the old implementation returned
 * `undefined` there, which was an accident of `winner && …`).
 */
export function underdogBonus(
  winner: string | undefined | null,
  allBets: { winner: string }[],
): boolean {
  if (!winner) {
    return false;
  }
  return (
    allBets.filter((b) => b.winner === winner).length * 3 <= allBets.length
  );
}

/**
 * Points for a single finished game.
 *
 * - no bet placed: -1
 * - picked the winner: (pointDiff + bonus) * multiplier
 * - picked the loser: -pointDiff (neither bonus nor doubler apply to losses)
 * - tie: 0
 * - scores not comparable (e.g. NaN): 0, so a single bad row cannot turn a
 *   user's whole total into NaN.
 */
export function gamePoints({
  homeScore,
  awayScore,
  bet,
  allBets,
  doubled,
}: GamePointsInput): number {
  if (!bet) {
    return -1;
  }

  const multi = doubled ? 2 : 1;
  const extraPoint = underdogBonus(bet.winner, allBets) ? 1 : 0;

  if (homeScore > awayScore) {
    return bet.winner === 'home'
      ? (bet.pointDiff + extraPoint) * multi
      : -bet.pointDiff;
  }

  if (awayScore > homeScore) {
    return bet.winner === 'away'
      ? (bet.pointDiff + extraPoint) * multi
      : -bet.pointDiff;
  }

  if (homeScore === awayScore) {
    return 0;
  }

  return 0;
}

/**
 * Sort key for a team's playoff seed. A missing seed (null/undefined) and the
 * `0` that `findStat` returns for a failed lookup are both "unknown", and are
 * sorted behind every real seed instead of in front of it. Equal keys keep
 * their input order, so the result no longer depends on the sort algorithm.
 */
function seedOf(team?: Team | null): number {
  const seed = team?.playoffSeed;
  return seed === null || seed === undefined || seed === 0
    ? Number.POSITIVE_INFINITY
    : seed;
}

/**
 * Points for a division bet: 7 for the division winner, 1 for each of the
 * remaining three places, plus a 5 point bonus for getting all four right.
 */
export function divisionPoints(bet: DivisionBet): number {
  const picks = [bet.first, bet.second, bet.third, bet.fourth];
  const correctOrder = [...picks].sort((a, b) => seedOf(a) - seedOf(b));

  let score = 0;
  if (bet.first && bet.first.id === correctOrder[0]?.id) {
    score += 7;
  }
  if (bet.second && bet.second.id === correctOrder[1]?.id) {
    score += 1;
  }
  if (bet.third && bet.third.id === correctOrder[2]?.id) {
    score += 1;
  }
  if (bet.fourth && bet.fourth.id === correctOrder[3]?.id) {
    score += 1;
  }
  if (score === 10) {
    score += 5;
  }
  return score;
}
