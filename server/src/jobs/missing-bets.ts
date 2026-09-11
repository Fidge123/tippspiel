export function gamesWithoutBets<G extends { id: string }>(
  games: G[],
  bets: { game: { id: string }; league: { id: string } }[],
  leagues: { id: string }[],
): G[] {
  // Without this a user in no league would be reminded of every game.
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
