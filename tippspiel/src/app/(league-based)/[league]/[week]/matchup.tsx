import { Button } from "@headlessui/react";
import { Teams } from "~/components/week/teams";
import { api } from "~/trpc/server";

export default async function Matchup({ game: gameId, league }: Props) {
  if (!gameId) {
    return <h1>Error</h1>;
  }

  const game = await api.week.getGameWithTeams(gameId);
  const dummy = {
    name: "TBD",
    shortName: "TBD",
    logo: null,
    color1: null,
    color2: null,
  };
  const awayTeam = game?.awayTeam ?? dummy;
  const homeTeam = game?.homeTeam ?? dummy;
  const gameStatus = game?.status;
  // const isGameFinal = gameStatus === "Final" || gameStatus === "Final/OT";

  return (
    <div className="grid grid-cols-[28px_1fr_64px_1fr_28px] items-center gap-x-2 rounded-lg bg-gray-100 p-1">
      <Teams away={awayTeam} home={homeTeam} scores={game?.scores} />
      <div className="col-span-2 flex justify-between sm:col-span-1">
        {[5, 4, 3, 2, 1].map((num) => (
          <form key={num}>
            <Button className="rounded px-2">{num}</Button>
          </form>
        ))}
      </div>

      <form className="mx-auto">
        {gameStatus && (
          <span className="text-gray-600 text-xs">{gameStatus}</span>
        )}
        {/*<Button>Double</Button>*/}
      </form>

      <div className="col-span-2 flex justify-between sm:col-span-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <form key={num}>
            <Button className="rounded px-2">{num}</Button>
          </form>
        ))}
      </div>
    </div>
  );
}

interface Props {
  game: number;
  league: string;
}
