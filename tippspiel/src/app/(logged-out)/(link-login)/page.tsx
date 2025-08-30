import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session) {
    const defaultLeague = await api.league.getDefaultLeague();
    const allLeaguesReq = api.league.getLeagues();
    if (defaultLeague) {
      redirect(defaultLeague.id);
    } else {
      const firstLeague = (await allLeaguesReq)[0];
      if (firstLeague) {
        redirect(firstLeague.id);
      }
      redirect(`/leagues`);
    }
  }

  return (
    <main className="grid flex-grow place-content-center gap-4 p-8">
      <h1 className="text-xl">Willkommen auf nfl-tippspiel.de</h1>
      <p>
        Diese Website ist ein private Website und nicht für die öffentliche
        Nutzung gedacht.
      </p>
      <p>
        Diese Website wird von der National Football League weder gesponsert
        noch unterstützt. Diese Website besitzt keine Namen oder Logos, die
        eingetragene Marken der National Football League sind, noch erhebt sie
        Anspruch darauf.
      </p>
      <Link href="/impressum" className="text-blue-500 underline">
        Impressum
      </Link>
    </main>
  );
}
