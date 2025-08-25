import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session) {
    const leagues = await api.league.getLeaguesForDropdown();
    if (leagues[0]?.id) {
      redirect(`/${leagues[0]?.id}`);
    } else {
      redirect(`/leagues`);
    }
  }

  return (
    <main className="grid flex-grow place-content-center gap-4 p-8">
      <h1 className="text-xl">Willkommen zu nfl-tippspiel.de</h1>
      <p>
        Diese Website ist ein private Website und nicht für die öffentliche
        Nutzung gedacht.
      </p>
      <p>
        Es gibt keine Verbindung zwischen nfl-tippspiel.de und der National
        Football League.
      </p>
      <Link href="/impressum" className="text-blue-500 underline">
        Impressum
      </Link>
    </main>
  );
}
