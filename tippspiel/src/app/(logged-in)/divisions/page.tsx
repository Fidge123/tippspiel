import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Divisions() {
  const leagues = await api.league.getLeaguesForDropdown();
  const defaultLeague = await api.league.getDefaultLeague();

  if (!leagues || leagues.length === 0) {
    return (
      <main>
        Du bist aktuell in keiner Liga. Erstelle eine Liga oder lasse dich zu
        einer bestehenden Liga einladen.
      </main>
    );
  }

  redirect(`/${defaultLeague?.id ?? leagues[0]?.id}/divisions`);
}
