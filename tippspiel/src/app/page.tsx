import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="grid flex-grow place-content-center gap-4 p-8">
      {session ? (
        <h1 className="text-xl">Current User: {session.user?.email}</h1>
      ) : (
        <>
          <h1 className="text-xl">Willkommen zu nfl-tippspiel.de</h1>
          <p>
            Diese Website ist ein private Website und nicht für die öffentliche
            Nutzung gedacht.
          </p>
          <p>
            Es gibt keine Verbindung zwischen nfl-tippspiel.de und der National
            Football League.
          </p>
        </>
      )}
    </main>
  );
}
