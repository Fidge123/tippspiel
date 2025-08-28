import { Button } from "@headlessui/react";
import Image from "next/image";
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
  }
  const awayTeam = game?.awayTeam ?? dummy;
  const homeTeam = game?.homeTeam ?? dummy;

  const hasScores =
    game?.scores?.away?.total != null && game?.scores?.home?.total != null;
  const gameStatus = game?.status;
  const isGameFinal = gameStatus === "Final" || gameStatus === "Final/OT";

  return (
    <div className="contents">
      <Button
        className="flex rounded border-2 px-2 py-1 font-semibold"
        style={getTeamStyle(awayTeam.color1, awayTeam.color2)}
      >
        {awayTeam.logo && (
          <Image
            src={awayTeam.logo}
            alt={awayTeam.name}
            width={24}
            height={24}
            className="mr-1 size-6"
          />
        )}
        <span className="mx-auto hidden sm:block">{awayTeam.name}</span>
        <span className="mx-auto block sm:hidden">{awayTeam.shortName}</span>
      </Button>
      <div className="mx-auto flex flex-col items-center">
        {hasScores ? (
          <div className="flex items-center gap-1 font-bold text-sm tabular-nums">
            <span>{game.scores.away.total}</span>
            <span>@</span>
            <span>{game.scores.home.total}</span>
          </div>
        ) : (
          <span className="font-bold text-sm">@</span>
        )}

        {gameStatus && (
          <span
            className={`text-xs ${isGameFinal ? "text-gray-600" : "font-medium text-orange-600"}`}
          >
            {gameStatus}
          </span>
        )}
      </div>
      <Button
        className="flex rounded border-2 px-2 py-1 font-semibold"
        style={getTeamStyle(homeTeam.color1, homeTeam.color2)}
      >
        {homeTeam.logo && (
          <Image
            src={homeTeam.logo}
            alt={homeTeam.name}
            width={24}
            height={24}
            className="mr-1 size-6"
          />
        )}
        <span className="mx-auto hidden sm:block">{homeTeam.name}</span>
        <span className="mx-auto block sm:hidden">{homeTeam.shortName}</span>
      </Button>
    </div>
  );
}

function getTeamStyle(color1?: string | null, color2?: string | null) {
  return {
    backgroundColor: color1 ?? "#fff",
    borderColor: color2 ?? "#000",
    color: color1 ? "#fff" : "#000",
  };
}

interface Props {
  id: number;
}
