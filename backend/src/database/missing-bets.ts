/**
 * Pure part of `BetDataService.findGamesWithoutBets`: which of the upcoming
 * games is the user still missing a bet for?
 *
 * A user bets per league, so a game counts as missing as soon as there is one
 * league they are a member of that has no bet from them on that game. A user
 * who is in no league at all has nothing to be reminded about, so they get an
 * empty list rather than every game (`[].every(...)` is `true`, which used to
 * skip the game — same outcome, but stated on purpose).
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
