import { Button } from "@headlessui/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function DivisionsPage({ params }: Props) {
  const { league: leagueId } = await params;

  // Auth guard
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  // Load league via tRPC (validates access and provides season)
  let lg: { id: string; name: string; season: number };
  try {
    lg = await api.league.getLeague({ id: leagueId });
  } catch {
    redirect("/");
  }

  // Load all teams for this season via tRPC
  const teams = await api.teams.getTeamsBySeason(lg.season);

  // Existing season winner bet via tRPC (to highlight selection)
  const selection = await api.seasonWinner.getSelection({ leagueId });
  const selectedTeamId = selection?.team?.id ?? null;

  async function saveSeasonWinnerBet(formData: FormData) {
    "use server";

    const user = (await auth())?.user;
    if (!user) {
      redirect("/");
    }

    const teamValue = formData.get("team");
    const teamId = typeof teamValue === "string" ? Number(teamValue) : NaN;
    if (!Number.isInteger(teamId)) {
      return;
    }

    // Upsert the Superbowl bet through tRPC
    await api.seasonWinner.upsertSelection({ leagueId, teamId });

    // Revalidate by redirecting back (simple way without explicit revalidate)
    redirect(`/${leagueId}/divisions`);
  }

  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="font-bold text-2xl">Divisions & Superbowl</h1>
        <p className="mt-1 text-gray-700">
          Wähle deinen Superbowl-Sieger für die Saison {lg.season}.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Superbowl-Tipp</h2>

        <form action={saveSeasonWinnerBet}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {teams.map((t) => {
              const isSelected = selectedTeamId === t.id;
              return (
                <Button
                  key={t.id}
                  type="submit"
                  name="team"
                  value={t.id}
                  className={`flex items-center rounded border-2 px-2 py-1 font-semibold transition ${isSelected ? "ring-4 ring-yellow-400" : ""}
                  `}
                  style={getTeamStyle(t.color1, t.color2)}
                >
                  {t.logo ? (
                    <Image
                      src={t.logo}
                      alt={t.name}
                      width={24}
                      height={24}
                      className="mr-1 size-6"
                    />
                  ) : null}
                  <span className="mx-auto text-sm">{t.name}</span>
                </Button>
              );
            })}
          </div>
        </form>

        {selectedTeamId != null ? (
          <p className="text-gray-700 text-sm">
            Dein aktueller Tipp:{" "}
            <strong>
              {teams.find((tt) => tt.id === selectedTeamId)?.name ?? "—"}
            </strong>
          </p>
        ) : (
          <p className="text-gray-700 text-sm">Noch kein Tipp abgegeben.</p>
        )}
      </section>
    </main>
  );
}

function getTeamStyle(color1?: string | null, color2?: string | null) {
  return {
    backgroundColor: color1 ?? "#fff",
    borderColor: color2 ?? "#000",
    color: color1 ? "#fff" : "#000",
  };
}

interface Props {
  params: Promise<{ league: string }>;
}
