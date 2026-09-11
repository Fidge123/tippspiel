import { describe, expect, it } from 'vitest';

import { gamesWithoutBets } from './missing-bets';

const game = (id: string) => ({ id });
const bet = (gameId: string, leagueId: string) => ({
  game: { id: gameId },
  league: { id: leagueId },
});

describe('gamesWithoutBets', () => {
  it('returns games the user has not bet on', () => {
    expect(gamesWithoutBets([game('g1')], [], [{ id: 'l1' }])).toEqual([
      game('g1'),
    ]);
  });

  it('skips games the user has bet on in their only league', () => {
    expect(
      gamesWithoutBets([game('g1')], [bet('g1', 'l1')], [{ id: 'l1' }]),
    ).toEqual([]);
  });

  it('reminds when one of several leagues is still missing a bet', () => {
    expect(
      gamesWithoutBets(
        [game('g1')],
        [bet('g1', 'l1')],
        [{ id: 'l1' }, { id: 'l2' }],
      ),
    ).toEqual([game('g1')]);
  });

  it('is quiet once every league has a bet', () => {
    expect(
      gamesWithoutBets(
        [game('g1')],
        [bet('g1', 'l1'), bet('g1', 'l2')],
        [{ id: 'l1' }, { id: 'l2' }],
      ),
    ).toEqual([]);
  });

  it('ignores bets from another game', () => {
    expect(
      gamesWithoutBets([game('g1')], [bet('g2', 'l1')], [{ id: 'l1' }]),
    ).toEqual([game('g1')]);
  });

  it('returns nothing for a user who is in no league', () => {
    expect(gamesWithoutBets([game('g1')], [], [])).toEqual([]);
  });
});
