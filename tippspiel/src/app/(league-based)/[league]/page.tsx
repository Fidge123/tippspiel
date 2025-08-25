import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Home({params}: Props) {
  const leagueId = (await params).league;
  const leagues = await api.league.getLeaguesForDropdown();
  const league = leagues.find(l => l.id === leagueId);

  if (!league) {
    if (!leagues || leagues.length === 0) {
      return <main>Du bist aktuell in keiner Liga. Erstelle eine Liga oder lasse dich zu einer bestehenden Liga einladen.</main>
    } else {
      redirect(`/${leagues[0]?.id}`);
    }
  } else {
    return <main>Willkommen zu {league.name} ({league.season})</main>
  }
}

interface Props {
  params: Promise<{ league: string }>;
}
