import { describe, expect, it } from 'vitest';

import { divisionPoints, gamePoints, underdogBonus } from './scoring';

const bets = (n: number, winner: string) =>
  Array.from({ length: n }, () => ({ winner }));

/** A field of `total` bets of which `picks` are on 'home'. */
const field = (picks: number, total: number) => [
  ...bets(picks, 'home'),
  ...bets(total - picks, 'away'),
];

describe('underdogBonus', () => {
  it.each([
    { picks: 3, total: 9, expected: true },
    { picks: 4, total: 9, expected: false },
    { picks: 1, total: 3, expected: true },
    { picks: 2, total: 3, expected: false },
  ])(
    '$picks of $total picks for your side -> $expected',
    ({ picks, total, expected }) => {
      expect(underdogBonus('home', field(picks, total))).toBe(expected);
    },
  );

  it('is false, not undefined, without a winner', () => {
    expect(underdogBonus(undefined, field(1, 3))).toBe(false);
    expect(underdogBonus(null, field(1, 3))).toBe(false);
    expect(underdogBonus('', field(1, 3))).toBe(false);
  });

  it('is true on an empty field (0 * 3 <= 0), as it always was', () => {
    expect(underdogBonus('home', [])).toBe(true);
  });
});

describe('gamePoints', () => {
  // 4 of 9 picks on 'home' -> no bonus for home, no bonus for away either
  // (5 * 3 = 15 > 9), so this field is bonus-free for both sides.
  const noBonus = field(4, 9);
  // 3 of 9 picks on 'home' -> bonus for home only.
  const homeBonus = field(3, 9);

  const home = { winner: 'home', pointDiff: 7 };
  const away = { winner: 'away', pointDiff: 7 };

  it('gives -1 when the user placed no bet', () => {
    expect(
      gamePoints({
        homeScore: 21,
        awayScore: 3,
        bet: undefined,
        allBets: noBonus,
        doubled: false,
      }),
    ).toBe(-1);
  });

  it('gives +pointDiff for picking the winner', () => {
    expect(
      gamePoints({
        homeScore: 21,
        awayScore: 3,
        bet: home,
        allBets: noBonus,
        doubled: false,
      }),
    ).toBe(7);
    expect(
      gamePoints({
        homeScore: 3,
        awayScore: 21,
        bet: away,
        allBets: noBonus,
        doubled: false,
      }),
    ).toBe(7);
  });

  it('gives -pointDiff for picking the loser', () => {
    expect(
      gamePoints({
        homeScore: 3,
        awayScore: 21,
        bet: home,
        allBets: noBonus,
        doubled: false,
      }),
    ).toBe(-7);
    expect(
      gamePoints({
        homeScore: 21,
        awayScore: 3,
        bet: away,
        allBets: noBonus,
        doubled: false,
      }),
    ).toBe(-7);
  });

  it('gives 0 for a tie', () => {
    expect(
      gamePoints({
        homeScore: 17,
        awayScore: 17,
        bet: home,
        allBets: noBonus,
        doubled: true,
      }),
    ).toBe(0);
  });

  it('doubles a win when the doubler is on this game', () => {
    expect(
      gamePoints({
        homeScore: 21,
        awayScore: 3,
        bet: home,
        allBets: noBonus,
        doubled: true,
      }),
    ).toBe(14);
  });

  it('adds one point for the underdog bonus', () => {
    expect(
      gamePoints({
        homeScore: 21,
        awayScore: 3,
        bet: home,
        allBets: homeBonus,
        doubled: false,
      }),
    ).toBe(8);
  });

  it('doubles the bonus too: (pointDiff + 1) * 2', () => {
    expect(
      gamePoints({
        homeScore: 21,
        awayScore: 3,
        bet: home,
        allBets: homeBonus,
        doubled: true,
      }),
    ).toBe(16);
  });

  it('does not apply the doubler to a loss', () => {
    expect(
      gamePoints({
        homeScore: 3,
        awayScore: 21,
        bet: home,
        allBets: noBonus,
        doubled: true,
      }),
    ).toBe(-7);
  });

  it('does not apply the bonus to a loss', () => {
    expect(
      gamePoints({
        homeScore: 3,
        awayScore: 21,
        bet: home,
        allBets: homeBonus,
        doubled: false,
      }),
    ).toBe(-7);
  });

  it('returns 0 rather than undefined for incomparable scores', () => {
    const points = gamePoints({
      homeScore: NaN,
      awayScore: 3,
      bet: home,
      allBets: noBonus,
      doubled: false,
    });
    expect(points).toBe(0);
    expect(0 + points).not.toBeNaN();
  });
});

describe('divisionPoints', () => {
  const teams = {
    a: { id: 'a', playoffSeed: 1 },
    b: { id: 'b', playoffSeed: 2 },
    c: { id: 'c', playoffSeed: 3 },
    d: { id: 'd', playoffSeed: 4 },
  };

  it('gives 15 for all four correct (10 + 5 bonus)', () => {
    expect(
      divisionPoints({
        first: teams.a,
        second: teams.b,
        third: teams.c,
        fourth: teams.d,
      }),
    ).toBe(15);
  });

  it('gives 7 for the division winner alone', () => {
    expect(
      divisionPoints({
        first: teams.a,
        second: teams.c,
        third: teams.d,
        fourth: teams.b,
      }),
    ).toBe(7);
  });

  it('gives 1 for each of the other places', () => {
    // b in 2nd is right, a and c/d swapped around it.
    expect(
      divisionPoints({
        first: teams.c,
        second: teams.b,
        third: teams.a,
        fourth: teams.d,
      }),
    ).toBe(2);
  });

  it('gives 0 when nothing is correct', () => {
    expect(
      divisionPoints({
        first: teams.d,
        second: teams.c,
        third: teams.b,
        fourth: teams.a,
      }),
    ).toBe(0);
  });

  it('sorts teams without a playoff seed behind seeded teams', () => {
    const unseeded = { id: 'x', playoffSeed: null };
    expect(
      divisionPoints({
        first: teams.a,
        second: teams.b,
        third: teams.c,
        fourth: unseeded,
      }),
    ).toBe(15);
  });

  it('treats a playoffSeed of 0 (a failed lookup) as unseeded', () => {
    const failed = { id: 'x', playoffSeed: 0 };
    expect(
      divisionPoints({
        first: teams.a,
        second: teams.b,
        third: teams.c,
        fourth: failed,
      }),
    ).toBe(15);
  });

  it('keeps the picked order among teams that are all unseeded', () => {
    const none = [{ id: 'w' }, { id: 'x' }, { id: 'y' }, { id: 'z' }] as const;
    expect(
      divisionPoints({
        first: none[0],
        second: none[1],
        third: none[2],
        fourth: none[3],
      }),
    ).toBe(15);
  });
});
