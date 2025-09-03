import { BetButtonLoading } from "~/components/week/bet-button";
import { Teams } from "~/components/week/teams";
import { api } from "~/trpc/server";

export default async function MatchupLoading({ id }: Props) {
  if (!id) {
    return <h1>Error</h1>;
  }

  const game = await api.week.getGameWithTeams(id);
  const dummy = {
    name: "TBD",
    shortName: "TBD",
    logo: null,
    color1: null,
    color2: null,
  };
  const awayTeam = game?.awayTeam ?? dummy;
  const homeTeam = game?.homeTeam ?? dummy;

  // const isGameFinal = gameStatus === "Final" || gameStatus === "Final/OT";

  return (
    <div className="grid grid-cols-[32px_1fr_10px_10px_1fr_32px] items-center gap-x-2 rounded-lg bg-gray-100 p-1 sm:grid-cols-[40px_1fr_28px_28px_1fr_40px]">
      <Teams away={awayTeam} home={homeTeam} scores={game?.scores} />
      <div className="col-span-3 flex justify-between gap-px sm:col-span-1">
        {[5, 4, 3, 2, 1].map((num) => (
          <BetButtonLoading key={num} amount={num} team={awayTeam} />
        ))}
      </div>
      <span className="mx-auto hidden text-center text-gray-600 text-xs sm:col-span-2 sm:block">
        {game?.date.toLocaleString("de-De", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      <div className="col-span-3 flex justify-between gap-px sm:col-span-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <BetButtonLoading key={num} amount={num} team={homeTeam} />
        ))}
      </div>
    </div>
  );
}

interface Props {
  id: number;
}
