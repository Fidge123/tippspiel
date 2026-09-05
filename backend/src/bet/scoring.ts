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
  bet?: Bet;
  allBets: { winner: string }[];
  doubled: boolean;
}

/** True when the picked side is at most a third of the field. */
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

/** Neither the bonus nor the doubler applies to a loss. */
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

  // Incomparable scores would otherwise fall through and turn a total into NaN.
  return 0;
}

/** A missing seed and the 0 of a failed lookup sort behind every real seed. */
function seedOf(team?: Team | null): number {
  const seed = team?.playoffSeed;
  return seed === null || seed === undefined || seed === 0
    ? Number.POSITIVE_INFINITY
    : seed;
}

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
