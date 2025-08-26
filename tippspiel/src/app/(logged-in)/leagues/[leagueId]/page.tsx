import { Button, Field, Input, Label } from "@headlessui/react";
import Link from "next/link";
import { api } from "~/trpc/server";
import { DefaultLeagueButton } from "./default-league-button";
import MembersList from "./members-list";
import { renameLeagueAction } from "./rename-league";

export default async function LeagueDetailPage({ params }: Props) {
  const id = (await params).leagueId;
  const league = await api.league.getLeague({ id });
  const defaultLeague = await api.league.getDefaultLeague();

  const isLeagueAdmin = league.members.some((m) => m.isYou && m.isAdmin);
  const isDefaultLeague = defaultLeague?.id === league.id;

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
            <Field>
              <Label className="hidden">Liga-Name</Label>
              <Input
                name="name"
                type="text"
                required
                maxLength={64}
                defaultValue={league.name}
                className="w-full max-w-md rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-2 focus:outline-blue-500"
              />
            </Field>

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
        <h2 className="text-lg">Standard-Liga</h2>
        <DefaultLeagueButton
          leagueId={league.id}
          isDefault={isDefaultLeague}
          leagueName={league.name}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg">Mitglieder</h2>
        <MembersList leagueId={league.id} members={league.members} />
      </section>
    </main>
  );
}
interface Props {
  params: Promise<{ leagueId: string }>;
}
