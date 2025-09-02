import { redirect } from "next/navigation";
import { Suspense } from "react";
import WeekNavigation from "~/components/week/week-navigation";
import { db } from "~/server/db";
import { api } from "~/trpc/server";
import Matchup from "./matchup";
import MatchupLoading from "./matchup-loading";

export const revalidate = 3_600; // 1 hour

function groupGamesByStartTime(games: Array<{ id: number; date: Date }>) {
  const grouped = new Map<string, Array<{ id: number; date: Date }>>();

  for (const game of games) {
    const dateKey = game.date.toLocaleDateString("de-DE", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit",
    });
    const timeKey = game.date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fullKey = `${dateKey} ${timeKey}`;

    const existingGames = grouped.get(fullKey);
    if (existingGames) {
      existingGames.push(game);
    } else {
      grouped.set(fullKey, [game]);
    }
  }

  return Array.from(grouped.entries()).sort(([keyA], [keyB]) => {
    const gamesA = grouped.get(keyA);
    const gamesB = grouped.get(keyB);
    if (!gamesA?.[0] || !gamesB?.[0]) {
      return 0;
    }

    const dateA = new Date(gamesA[0].date);
    const dateB = new Date(gamesB[0].date);
    return dateA.getTime() - dateB.getTime();
  });
}

export async function generateStaticParams() {
  const weeks = await db.query.week.findMany({
    where: (w, { and, eq, ne }) =>
      and(
        ne(w.stage, "Pre Season"),
        ne(w.week, "Pro Bowl"),
        eq(w.season, 2025),
      ),
    orderBy: (w, { asc }) => [asc(w.start)],
  });
  return weeks.map((w) => ({ week: w.id }));
}

export default async function WeekPage({ params }: Props) {
  const { week: weekId, league } = await params;
  const week = await api.week.getWeek(weekId);
  const games = await api.week.getGamesByWeek(weekId);
  const byes = await api.week.getByesByWeek(weekId);

  if (!week) {
    redirect(`/${league}`);
  }

  const groupedGames = groupGamesByStartTime(games);

  // TODO check zeiten der spiele => 2 Stunden zu früh
  // TODO check ob slider sinnvoll wäre oder mehrere buttons
  return (
    <main className="w-fit p-4">
      <header className="mb-2">
        <WeekNavigation weekId={weekId} league={league}>
          <h1 className="font-bold text-2xl">{week.week}</h1>
        </WeekNavigation>
      </header>

      {groupedGames.map(([timeSlot, gameGroup]) => (
        <section
          key={timeSlot}
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
