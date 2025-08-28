import { Button } from "@headlessui/react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { api } from "~/trpc/server";
import DeadlineTimer from "./deadline-timer";

export default async function DivisionsPage({ params }: Props) {
  const { league: leagueId } = await params;

  const lg = await api.league.getLeague({ id: leagueId });
  const teamsByDivision = await api.teams.getTeamsWithDivisionsBySeason(
    lg.season,
  );
  const selection = await api.seasonWinner.getSelection({ leagueId });
  const deadline = await api.seasonWinner.getDeadline({ season: lg.season });

  const selectedTeamId = selection?.team?.id ?? null;
  const isDeadlinePassed = deadline
    ? new Date() >= new Date(deadline.deadline)
    : false;

  // Flatten teams for easier lookup
  const allTeams = Object.values(teamsByDivision).flat();

  async function saveSeasonWinnerBet(formData: FormData) {
    "use server";

    const teamValue = formData.get("team") as string;
    await api.seasonWinner.upsertSelection({
      leagueId,
      teamId: parseInt(teamValue),
    });
    revalidatePath(`/${leagueId}/divisions`);
  }

  return (
    <main className="p-6">
      <header className="mb-6 flex justify-between">
        <div>
          <h1 className="font-bold text-2xl">Divisions & Superbowl</h1>
          <p className="mt-1 text-gray-700">
            Wähle deinen Superbowl-Sieger für die Saison {lg.season}.
          </p>
        </div>
        {deadline && (
          <div className="rounded-lg border-2 border-yellow-400 px-4 py-2">
            {isDeadlinePassed ? (
              <p className="text-sm">
                <strong>Deadline verstrichen:</strong> Superbowl-Tipps können
                nur vor dem ersten Spiel der Saison abgegeben werden.
              </p>
            ) : (
              <div>
                <DeadlineTimer deadline={deadline.deadline} />
              </div>
            )}
          </div>
        )}
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Superbowl-Tipp</h2>
        <form action={saveSeasonWinnerBet}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(teamsByDivision).map(([divisionId, teams]) => (
              <div key={divisionId} className="space-y-2">
                {teams.map((t) => {
                  const isSelected = selectedTeamId === t.id;
                  return (
                    <Button
                      key={t.id}
                      type="submit"
                      name="team"
                      value={t.id}
                      disabled={isDeadlinePassed}
                      className={`flex w-full items-center rounded px-2 py-1 font-semibold transition ${
                        isDeadlinePassed
                          ? "cursor-not-allowed bg-gray-200 text-gray-400"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      style={
                        isSelected && !isDeadlinePassed
                          ? getTeamStyle(t.color1, t.color2)
                          : {}
                      }
                    >
                      {t.logo ? (
                        <Image
                          src={t.logo}
                          alt={t.name}
                          width={24}
                          height={24}
                          className="mr-2 size-6"
                        />
                      ) : null}
                      <span className="text-sm">{t.name}</span>
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>
        </form>

        {selectedTeamId != null ? (
          <p className="text-gray-700 text-sm">
            Dein aktueller Tipp:{" "}
            <strong>
              {allTeams.find((tt) => tt.id === selectedTeamId)?.name ?? "—"}
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
    border: `solid 2px ${color2 ?? "#000"}`,
    backgroundColor: color1 ?? "#fff",
    color: color1 ? "#fff" : "#000",
  };
}

interface Props {
  params: Promise<{ league: string }>;
}
