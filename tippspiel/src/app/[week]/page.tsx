import { db } from "~/server/db";
import MatchupLoading from "./matchup-loading";

export const revalidate = 3_600; // 1 hour

export async function generateStaticParams() {
  const weeks = await db.query.week.findMany({
    where: (week, { eq, ne, and }) =>
      and(ne(week.stage, "Pre Season"), eq(week.season, 2025)),
  });

  return weeks.map((week) => ({ week: week.id }));
}

export default async function WeekPage({ params }: Props) {
  const weekId = (await params).week;
  const week = await db.query.week.findFirst({
    where: (week, { eq }) => eq(week.id, weekId),
  });
  const games = await db.query.game.findMany({
    where: (game, { eq }) => eq(game.week, weekId),
  });

  if (!week) {
    throw new Error(`Week with id ${weekId} not found`);
  }

  return (
    <main className="p-4">
      <h1>
        {week.stage} - {week.week}
      </h1>
      <ul className="grid grid-cols-[1fr_64px_1fr] gap-2 w-fit items-center">
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
  params: Promise<{ week: string }>;
}
