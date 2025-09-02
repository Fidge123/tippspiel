import { redirect } from "next/navigation";
import { Suspense } from "react";
import WeekNavigation from "~/components/week/week-navigation";
import { api } from "~/trpc/server";
import Matchup from "./matchup";
import MatchupLoading from "./matchup-loading";

export default async function WeekPage({ params }: Props) {
  const { week: weekId, league } = await params;
  const week = await api.week.getWeek(weekId);
  const groupedGames = await api.week.getGamesByWeek(weekId);
  const byes = await api.week.getByesByWeek(weekId);

  if (!week) {
    redirect(`/${league}`);
  }

  return (
    <main className="w-fit p-4">
      <header>
        <WeekNavigation weekId={weekId} league={league}>
          <div>
            <h1 className="font-bold text-2xl">{week.week}</h1>
            <p className="text-gray-600 text-sm">
              {`${week.start?.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })} - ${week.end?.toLocaleDateString("de-DE")}`}
            </p>
          </div>
        </WeekNavigation>
      </header>

      {groupedGames.map((gameGroup) => (
        <section
          key={gameGroup[0]?.date.toISOString()}
          className="w-sm border-gray-300 not-last:border-b-2 py-2 sm:w-full"
        >
          {/*<h2
            key={`${timeSlot}-header`}
            className="col-span-3 py-1 text-gray-700 text-xs"
          >
            {timeSlot}
          </h2>*/}
          <div className="space-y-2">
            {gameGroup.map((game) => (
              <Suspense
                key={game.id}
                fallback={<MatchupLoading id={game.id} />}
              >
                <Matchup game={game.id} key={game.id} league={league} />
              </Suspense>
            ))}
          </div>
        </section>
      ))}

      {byes.length > 0 && (
        <section className="flex flex-wrap items-center gap-2 px-1 py-2">
          <h2 className="font-bold text-gray-700">Byes</h2>
          {byes.map((bye) => (
            <div
              key={bye.team.id}
              className="flex items-center gap-2 rounded-lg bg-gray-100 p-2"
            >
              <img
                src={bye.team.logo}
                alt={`${bye.team.name} logo`}
                className="size-4"
              />
              <span className="font-medium text-sm">{bye.team.shortName}</span>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

interface Props {
  params: Promise<{ week: string; league: string }>;
}
