import { Button } from "@headlessui/react";
import Image from "next/image";
import { api } from "~/trpc/server";

export default async function MatchupLoading({ id }: Props) {
  if (!id) {
    return <h1>Error</h1>;
  }

  const game = await api.week.getGameWithTeams(id);
  const awayTeam = game?.awayTeam ?? {
    name: "TBD",
    logo: null,
    color1: null,
    color2: null,
  };
  const homeTeam = game?.homeTeam ?? {
    name: "TBD",
    logo: null,
    color1: null,
    color2: null,
  };

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
        <span className="mx-auto">{awayTeam.name}</span>
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
        <span className="mx-auto">{homeTeam.name}</span>
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
