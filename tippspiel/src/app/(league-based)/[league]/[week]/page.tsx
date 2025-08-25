import { db } from "~/server/db";
import { api } from "~/trpc/server";
import MatchupLoading from "./matchup-loading";

export const revalidate = 3_600; // 1 hour

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
  const weekId = (await params).week;
  const week = await api.week.getWeek({ id: weekId });
  const games = await api.week.getGamesByWeek({ weekId });

  if (!week) {
    throw new Error(`Week with id ${weekId} not found`);
  }

  return (
    <main className="p-4">
      <h1>
        {week.stage} - {week.week}
      </h1>
      <ul className="grid w-fit grid-cols-[1fr_64px_1fr] items-center gap-2">
        {games.map((game) => (
          <li key={game.id} className="contents">
            <MatchupLoading id={game.id}></MatchupLoading>
          </li>
        ))}
      </ul>
    </main>
  );
}

interface Props {
  params: Promise<{ week: string; league: string }>;
}
