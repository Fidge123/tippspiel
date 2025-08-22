import { api } from "~/trpc/server";

export default async function Leagues() {
  const league = await api.league.getLeagues();

  return (
    <main className="grid flex-grow place-content-center gap-4 p-8">
      <h1 className="text-xl">Leagues</h1>
      <ul>
        {league.map((l) => (
          <li key={l.id}>
            {l.name} ({l.members.join(", ")})
          </li>
        ))}
      </ul>
    </main>
  );
}
