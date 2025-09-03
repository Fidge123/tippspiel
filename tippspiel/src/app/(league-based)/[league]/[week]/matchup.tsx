import { BetButton } from "~/components/week/bet-button";
import { Teams } from "~/components/week/teams";
import { api } from "~/trpc/server";

export default async function Matchup({ game: gameId, league, week }: Props) {
  if (!gameId) {
    return <h1>Error</h1>;
  }

  const game = await api.week.getGameWithTeams(gameId);
  const bet = await api.gameBet.getUserBet({ gameId, leagueId: league });

  const dummy = {
    id: 0,
    name: "TBD",
    shortName: "TBD",
    logo: null,
    color1: null,
    color2: null,
  };
  const awayTeam = game?.awayTeam ?? dummy;
  const homeTeam = game?.homeTeam ?? dummy;

  const now = new Date();
  const gameHasStarted = game
    ? now >= game.date || game.status !== "Not Started"
    : false;

  return (
    <div className="grid grid-cols-[28px_1fr_64px_1fr_28px] items-center gap-x-2 rounded-lg bg-gray-100 p-1 sm:grid-cols-[40px_1fr_64px_1fr_40px]">
      <Teams away={awayTeam} home={homeTeam} scores={game?.scores} />
      <div className="col-span-2 flex justify-between sm:col-span-1">
        {[5, 4, 3, 2, 1].map((num) => (
          <BetButton
            key={num}
            amount={num}
            team={awayTeam}
            selected={bet?.team === awayTeam.id && bet?.value === num}
            gameId={gameId}
            leagueId={league}
            week={week}
            disabled={gameHasStarted}
          />
        ))}
      </div>

      <span className="mx-auto text-gray-600 text-xs">
        {game?.date.toLocaleString("de-De", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>

      <div className="col-span-2 flex justify-between sm:col-span-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <BetButton
            key={num}
            amount={num}
            team={homeTeam}
            selected={bet?.team === homeTeam.id && bet?.value === num}
            gameId={gameId}
            leagueId={league}
            week={week}
            disabled={gameHasStarted}
          />
        ))}
      </div>
    </div>
  );
}

interface Props {
  game: number;
  league: string;
  week: string;
}
