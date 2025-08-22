import { api } from "~/trpc/server";

export default async function Leagues() {
  const league = await api.league.getLeagues();

  return (
    <main className="grid flex-grow place-content-center gap-4 p-8">
      <h1 className="text-xl">Ligen</h1>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="*:p-2 *:text-left">
            <th>Liga</th>
            <th>Saison</th>
            <th>Mitglieder</th>
          </tr>
        </thead>
        <tbody className="divide-y border-t">
          {league.map((l) => (
            <tr key={l.id} className="*:p-2">
              <td>{l.name}</td>
              <td>{l.season}</td>
              <td className="flex flex-col">
                {l.members.map((m) =>
                  l.admins.includes(m) ? (
                    <span key={`${l.id}-${m}`} className="font-semibold">
                      {`${m} (Admin)`}
                    </span>
                  ) : (
                    <span key={`${l.id}-${m}`}>{m}</span>
                  ),
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
