import {
  divisionPoints,
  gamePoints,
  superbowlPoints,
  underdogBonus,
} from '../scoring';
import {
  currentWeek,
  finishedGames,
  leaderboardRows,
  leagueOf,
  superbowlWinner,
  type LeaderboardTeam,
} from './query';

export interface LeaderboardEntry {
  user: { id: string; name: string };
  bets: {
    game: string;
    bet?: { id: string; pointDiff: number; winner: string };
    doubler: boolean;
    bonus: boolean;
    points: number;
  }[];
  divBets: {
    name: string | null;
    first: LeaderboardTeam | null;
    second: LeaderboardTeam | null;
    third: LeaderboardTeam | null;
    fourth: LeaderboardTeam | null;
    points: number;
  }[];
  sbBet: { team: LeaderboardTeam | Record<string, never>; points: number };
  points: { bets: number; divBets: number; sbBet: number; all: number };
}

export interface Leaderboard {
  league: { id: string; name: string; season: number };
  entries: LeaderboardEntry[];
  revealed: { divBets: boolean; sbBet: boolean };
}

export async function buildLeaderboard(
  leagueId: string,
  season: number,
  viewerId: string,
): Promise<Leaderboard | undefined> {
  const league = await leagueOf(leagueId);
  if (!league || league.season !== season) {
    return undefined;
  }

  const week = await currentWeek();
  const isPlayoffs = week.seasontype === 3;
  const isFinalGame = isPlayoffs && week.week === 5;
  const past = season < week.year;

  const revealed = {
    divBets: isPlayoffs || past,
    sbBet: isFinalGame || past,
  };

  const [rows, games, sbWinner] = await Promise.all([
    leaderboardRows(leagueId, season, { ...revealed, viewerId }),
    finishedGames(leagueId, season),
    superbowlWinner(season),
  ]);

  const entries = rows.map((row) => {
    const doubled = new Set(
      row.bets.filter((bet) => bet.doubled).map((bet) => bet.gameId),
    );
    const own = new Map(row.bets.map((bet) => [bet.gameId, bet]));

    const bets = games.map((game) => {
      const mine = own.get(game.id);
      const bet =
        mine?.betId && mine.winner !== null && mine.pointDiff !== null
          ? { id: mine.betId, pointDiff: mine.pointDiff, winner: mine.winner }
          : undefined;

      return {
        game: game.id,
        bet,
        doubler: doubled.has(game.id),
        bonus: underdogBonus(bet?.winner, game.allBets),
        points: gamePoints({
          homeScore: game.homeScore,
          awayScore: game.awayScore,
          bet,
          allBets: game.allBets,
          doubled: doubled.has(game.id),
        }),
      };
    });

    const divBets = row.divBets.map((bet) => ({
      ...bet,
      // Division points only count once the season can be judged.
      points: revealed.divBets ? divisionPoints(bet) : 0,
    }));

    const sbBet = {
      team: row.sbBet?.team ?? {},
      points: superbowlPoints(row.sbBet, sbWinner),
    };

    const sums = {
      bets: bets.reduce((a, b) => a + b.points, 0),
      divBets: divBets.reduce((a, b) => a + b.points, 0),
      sbBet: sbBet.points,
    };

    return {
      user: { id: row.id, name: row.name },
      bets,
      divBets,
      sbBet,
      points: { ...sums, all: sums.bets + sums.divBets + sums.sbBet },
    };
  });

  entries.sort((a, b) => b.points.all - a.points.all);

  return { league, entries, revealed };
}
