/**
 * A game is missing as long as one of the user's leagues has no bet on it.
 * A user in no league gets nothing rather than every game.
 */
export function gamesWithoutBets<G extends { id: string }>(
  games: G[],
  bets: { game: { id: string }; league: { id: string } }[],
  leagues: { id: string }[],
): G[] {
  if (leagues.length === 0) {
    return [];
  }
  return games.filter((game) =>
    leagues.some(
      (league) =>
        !bets.some(
          (bet) => bet.league.id === league.id && bet.game.id === game.id,
        ),
    ),
  );
}
