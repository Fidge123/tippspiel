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
      <span className="mx-auto">@</span>
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
