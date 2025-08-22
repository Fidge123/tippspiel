import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Input } from "@headlessui/react";
import { api } from "~/trpc/server";
import MembersList from "./members-list";
import { renameLeagueAction } from "./rename-league";

export default async function LeagueDetailPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const leagues = await api.league.getLeagues();
  const league = leagues.find((l) => l.id === params.leagueId);

  if (!league) {
    notFound();
  }

  const isLeagueAdmin = league.members.some((m) => m.isYou && m.isAdmin);

  return (
    <main className="max-w-3xl space-y-8 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Liga-Details</h1>
        <Link
          href="/leagues"
          className="text-blue-600 hover:text-blue-700 hover:underline"
        >
          Zurück zur Übersicht
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg">Name</h2>
        {isLeagueAdmin ? (
          <form action={renameLeagueAction} className="flex items-center gap-2">
            <Input type="hidden" name="leagueId" value={league.id} />
            <Input
              name="name"
              type="text"
              required
              maxLength={64}
              defaultValue={league.name}
              className="w-full max-w-md rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-2 focus:outline-blue-500"
            />
            <Button
              type="submit"
              className="rounded bg-blue-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700"
            >
              Umbenennen
            </Button>
          </form>
        ) : (
          <p className="text-gray-900">{league.name}</p>
        )}
      </section>

      <section className="space-y-1">
        <h2 className="text-lg">Saison</h2>
        <p className="text-gray-900">{league.season}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg">Mitglieder</h2>
        <MembersList leagueId={league.id} members={league.members} />
      </section>
    </main>
  );
}
