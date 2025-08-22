import { revalidatePath } from "next/cache";
import { api } from "~/trpc/server";

async function leaveLeagueAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId");
  if (typeof leagueId !== "string" || leagueId.length === 0) return;
  await api.league.leaveLeague({ leagueId });
  revalidatePath("/leagues");
}

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
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y border-t">
          {league.map((l) => (
            <tr key={l.id} className="*:p-2">
              <td>{l.name}</td>
              <td>{l.season}</td>
              <td className="flex flex-col">
                {l.members.map((m) =>
                  m.isAdmin ? (
                    <span key={m.id} className="font-semibold">
                      {`${m.name} (Admin)`}
                    </span>
                  ) : (
                    <span key={m.id}>{m.name}</span>
                  ),
                )}
              </td>
              <td className="p-2">
                <form action={leaveLeagueAction}>
                  <input type="hidden" name="leagueId" value={l.id} />
                  <button
                    type="submit"
                    disabled={
                      l.members.length > 1 &&
                      l.members.filter((m) => m.isAdmin).length === 1 &&
                      l.members.some((m) => m.isYou && m.isAdmin)
                    }
                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-500"
                  >
                    {l.members.length > 1 ? "Verlassen" : "Löschen"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
