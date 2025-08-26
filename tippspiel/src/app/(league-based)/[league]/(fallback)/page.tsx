import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Home({ params }: Props) {
  const leagueId = (await params).league;
  const leagues = await api.league.getLeaguesForDropdown();
  const defaultLeague = await api.league.getDefaultLeague();
  const league = leagues.find((l) => l.id === leagueId);

  if (!leagues || leagues.length === 0) {
    return (
      <main>
        Du bist aktuell in keiner Liga. Erstelle eine Liga oder lasse dich zu
        einer bestehenden Liga einladen.
      </main>
    );
  }

  const currentWeek = await api.week.getCurrentWeek();
  if (currentWeek) {
    redirect(
      `/${leagueId ?? defaultLeague?.id ?? leagues[0]?.id}/${currentWeek.id}`,
    );
  } else {
    return (
      <main className="p-4">
        Willkommen zu {league?.name} ({league?.season})
      </main>
    );
  }
}

interface Props {
  params: Promise<{ league: string }>;
}
