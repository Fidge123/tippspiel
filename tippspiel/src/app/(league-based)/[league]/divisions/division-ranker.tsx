import { Button } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import type { DivisionBetSelection } from "~/server/api/routers/division-bet";
import type { TeamWithDivision } from "~/server/api/routers/teams";
import { getAction } from "./division-action";

export default async function DivisionRanker({
  division,
  teams,
  leagueId,
  existingBet,
  isDeadlinePassed,
}: Props) {
  const action = await getAction(leagueId, division.id);
  const orderedTeams = (() => {
    if (existingBet) {
      const orderedTeams: TeamWithDivision[] = [];
      const teamById = new Map(teams.map((t) => [t.id, t]));

      if (existingBet.first) {
        const firstTeam = teamById.get(existingBet.first.id);
        if (firstTeam) orderedTeams.push(firstTeam);
      }
      if (existingBet.second) {
        const secondTeam = teamById.get(existingBet.second.id);
        if (secondTeam) orderedTeams.push(secondTeam);
      }
      if (existingBet.third) {
        const thirdTeam = teamById.get(existingBet.third.id);
        if (thirdTeam) orderedTeams.push(thirdTeam);
      }
      if (existingBet.fourth) {
        const fourthTeam = teamById.get(existingBet.fourth.id);
        if (fourthTeam) orderedTeams.push(fourthTeam);
      }

      return orderedTeams;
    }
    return teams;
  })();

  const getRankLabel = (index: number) => {
    switch (index) {
      case 0:
        return "1.";
      case 1:
        return "2.";
      case 2:
        return "3.";
      case 3:
        return "4.";
      default:
        return `${index + 1}.`;
    }
  };

  const currentOrder = orderedTeams.map((team) => team.id).join(",");

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{division.name}</h3>
        {existingBet && !isDeadlinePassed && (
          <div className="text-right">
            <p className="text-gray-500 text-xs">
              {`Gespeichert am ${new Date(
                existingBet.updatedAt,
              ).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
              })} um ${new Date(existingBet.updatedAt).toLocaleTimeString(
                "de-DE",
                { hour: "2-digit", minute: "2-digit" },
              )}`}
            </p>
          </div>
        )}
      </header>

      <div className="space-y-2">
        {orderedTeams.map((team, index) => (
          <div
            key={team.id}
            className="flex items-center rounded-lg bg-white p-2"
            style={{
              border: `solid 2px ${team.color1 ?? "#ddd"}`,
            }}
          >
            <span className="mr-3 w-6 font-bold text-sm">
              {getRankLabel(index)}
            </span>
            {team.logo && (
              <Image
                src={team.logo}
                alt={team.name}
                width={24}
                height={24}
                className="mr-3 size-6"
              />
            )}
            <span className="flex-1 font-medium text-sm">{team.shortName}</span>

            {!isDeadlinePassed && (
              <div className="flex gap-1">
                <form action={action}>
                  <input type="hidden" name="teamId" value={team.id} />
                  <input type="hidden" name="direction" value="down" />
                  <input
                    type="hidden"
                    name="currentOrder"
                    value={currentOrder}
                  />
                  <Button
                    type="submit"
                    disabled={index === orderedTeams.length - 1}
                    className={`rounded p-1 transition ${
                      index === orderedTeams.length - 1
                        ? "cursor-not-allowed text-gray-300"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <ChevronDownIcon className="size-4" />
                  </Button>
                </form>
                <form action={action}>
                  <input type="hidden" name="teamId" value={team.id} />
                  <input type="hidden" name="direction" value="up" />
                  <input
                    type="hidden"
                    name="currentOrder"
                    value={currentOrder}
                  />
                  <Button
                    type="submit"
                    disabled={index === 0}
                    className={`rounded p-1 transition ${
                      index === 0
                        ? "cursor-not-allowed text-gray-300"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                    <ChevronUpIcon className="size-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

interface Props {
  division: {
    id: string;
    name: string;
  };
  teams: TeamWithDivision[];
  leagueId: string;
  existingBet: DivisionBetSelection | null;
  isDeadlinePassed: boolean;
}
