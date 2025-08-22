import { Button, Input } from "@headlessui/react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { api } from "~/trpc/server";
import { createLeagueAction } from "./create-new-league";
import MembersList from "./members-list";
import { renameLeagueAction } from "./rename-league";

export default async function Leagues() {
  const league = await api.league.getLeagues();

  return (
    <main className="max-w-3xl space-y-8 p-4">
      <h1 className="text-xl">Ligen</h1>
      <section>
        <h2 className="py-2">Du bist Mitglied in den folgenden Ligen:</h2>
        <table className="w-full table-auto border-collapse">
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
                <td>
                  {l.members.some((m) => m.isYou && m.isAdmin) ? (
                    <form
                      action={renameLeagueAction}
                      className="flex items-center gap-2"
                    >
                      <Input type="hidden" name="leagueId" value={l.id} />
                      <Input
                        name="name"
                        type="text"
                        required
                        maxLength={64}
                        defaultValue={l.name}
                        className="rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:outline-2 focus:outline-blue-500"
                      />
                      <Button
                        title="Umbenennen"
                        type="submit"
                        className="rounded px-2 py-1 text-blue-600 text-sm hover:text-blue-700"
                      >
                        <PencilIcon className="size-5" />
                      </Button>
                    </form>
                  ) : (
                    l.name
                  )}
                </td>
                <td>{l.season}</td>
                <td className="flex flex-col gap-1">
                  <MembersList leagueId={l.id} members={l.members} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="py-2">Neue Liga erstellen</h2>
        <form action={createLeagueAction} className="mt-2 flex gap-2">
          <Input
            name="name"
            type="text"
            required
            maxLength={64}
            placeholder="Name der Liga"
            className="flex-1 rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-2 focus:outline-blue-500"
          />
          <Button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:bg-blue-700"
          >
            Erstellen
          </Button>
        </form>
      </section>
    </main>
  );
}
