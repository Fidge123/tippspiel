import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="grid flex-grow place-content-center gap-4">
        <h1 className="text-xl">Willkommen zu nfl-tippspiel.de</h1>
        <p>
          Diese Website ist ein private Website und nicht für die öffentliche
          Nutzung gedacht.
        </p>
        <p>
          Es gibt keine Verbindung zwischen nfl-tippspiel.de und der National
          Football League.
        </p>
      </main>
    </HydrateClient>
  );
}
