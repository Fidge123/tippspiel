import { Button } from "@headlessui/react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { api } from "~/trpc/server";
import DeadlineTimer from "./deadline-timer";
import DivisionRanker from "./division-ranker";

export default async function DivisionsPage({ params }: Props) {
  const { league: leagueId } = await params;

  const lg = await api.league.getLeague({ id: leagueId });
  const teamsByDivision = await api.teams.getTeamsWithDivisionsBySeason(
    lg.season,
  );
  const selection = await api.seasonWinner.getSelection({ leagueId });
  const deadline = await api.seasonWinner.getDeadline({ season: lg.season });
  const divisionBets = await api.divisionBet.getDivisionBets({ leagueId });

  const selectedTeamId = selection?.team?.id ?? null;
  const isDeadlinePassed = deadline
    ? new Date() >= new Date(deadline.deadline)
    : false;

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
      <header className="mb-6 flex justify-between gap-8">
        <div className="text-balance">
          <h1 className="font-bold text-2xl">Divisions & Superbowl</h1>
          <p className="mt-1 mb-6 text-gray-700">
            Wähle deinen Superbowl-Sieger und sortiere die Teams in jeder
            Division für die Saison {lg.season}.
          </p>
        </div>
        {!isDeadlinePassed && deadline && (
          <div className="rounded-lg border-2 border-yellow-400 px-4 py-2">
            <DeadlineTimer deadline={deadline.deadline} />
          </div>
        )}
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Superbowl</h2>
        <form action={saveSeasonWinnerBet}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                      className={`flex w-full items-center rounded border-2 border-gray-100 bg-gray-100 px-2 py-1 font-semibold transition ${
                        isDeadlinePassed
                          ? "cursor-not-allowed"
                          : "hover:bg-gray-200"
                      }`}
                      style={isSelected ? getTeamStyle(t.color1, t.color2) : {}}
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
                      <span className="hidden text-sm sm:block">{t.name}</span>
                      <span className="block text-sm sm:hidden">
                        {t.shortName}
                      </span>
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

      <section className="mt-8 space-y-6">
        <h2 className="font-semibold text-lg">Divisions</h2>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(teamsByDivision).map(([divisionId, teams]) => {
            const division = teams[0]?.division;
            if (!division) return null;

            const existingBet =
              divisionBets.find((bet) => bet.division === divisionId) || null;

            return (
              <div key={divisionId} className="rounded-lg bg-gray-100 p-2">
                <DivisionRanker
                  division={{
                    id: divisionId,
                    name: division.id,
                  }}
                  teams={teams}
                  leagueId={leagueId}
                  existingBet={existingBet}
                  isDeadlinePassed={isDeadlinePassed}
                />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function getTeamStyle(color1?: string | null, color2?: string | null) {
  return {
    border: `solid 2px ${color2 ?? "#000"}`,
    backgroundColor: color1 ?? "#333",
    color: "#fff",
  };
}

interface Props {
  params: Promise<{ league: string }>;
}
