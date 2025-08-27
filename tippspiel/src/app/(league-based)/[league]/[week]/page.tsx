import { redirect } from "next/navigation";
import WeekNavigation from "~/components/week/week-navigation";
import { db } from "~/server/db";
import { api } from "~/trpc/server";
import MatchupLoading from "./matchup-loading";

export const revalidate = 3_600; // 1 hour

function groupGamesByStartTime(games: Array<{ id: number; date: string }>) {
  const grouped = new Map<string, Array<{ id: number; date: string }>>();

  for (const game of games) {
    const gameDate = new Date(game.date);
    const dateKey = gameDate.toLocaleDateString("de-DE", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit",
    });
    const timeKey = gameDate.toLocaleTimeString("de-DE", {
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

  return (
    <main className="w-fit p-4">
      <header className="mb-4">
        <WeekNavigation weekId={weekId} league={league}>
          <h1 className="font-bold text-2xl">{week.week}</h1>
        </WeekNavigation>
      </header>

      <div className="grid w-fit grid-cols-[1fr_64px_1fr] items-center gap-2">
        {groupedGames.map(([timeSlot, gameGroup]) => (
          <section key={timeSlot} className="contents">
            <h2
              key={`${timeSlot}-header`}
              className="col-span-3 font-bold text-gray-700"
            >
              {timeSlot}
            </h2>
            {gameGroup.map((game) => (
              <div key={game.id} className="contents">
                <MatchupLoading id={game.id} />
              </div>
            ))}
          </section>
        ))}
      </div>

      {byes.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-bold text-gray-700 text-xl">Bye Week</h2>
          <div className="flex flex-wrap gap-2">
            {byes.map((bye) => (
              <div
                key={bye.team.id}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2"
              >
                <img
                  src={bye.team.logo}
                  alt={`${bye.team.name} logo`}
                  className="h-6 w-6"
                />
                <span className="font-medium text-sm">
                  {bye.team.shortName}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

interface Props {
  params: Promise<{ week: string; league: string }>;
}
