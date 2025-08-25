import { Button, Input } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { api } from "~/trpc/server";
import { createLeagueAction } from "./create-new-league";

export default async function Leagues() {
  const leagues = await api.league.getLeagues();

  return (
    <main className="max-w-3xl space-y-8 p-4">
      <h1 className="text-xl">Ligen</h1>
      {leagues.length > 0 ? (
        <section>
          <h2 className="py-2">Du bist Mitglied in den folgenden Ligen:</h2>
          <ul className="divide-y divide-gray-300">
            <li className="grid grid-cols-[1fr_64px_2fr_24px] gap-4 p-3">
              <p>Name</p>
              <p>Saison</p>
              <p>Mitglieder</p>
            </li>
            {leagues.map((l) => (
              <li key={l.id} className="group">
                <Link
                  href={`/leagues/${l.id}`}
                  className="grid grid-cols-[1fr_64px_2fr_24px] gap-4 p-3 hover:bg-gray-50"
                  aria-label={`Zur Liga ${l.name}`}
                >
                  <p className="group-hover:underline">{l.name}</p>
                  <p className="text-gray-800">{l.season}</p>
                  <p className="truncate text-gray-800">
                    {l.members.map((m) => m.name).join(", ")}
                  </p>
                  <ChevronRightIcon className="mt-1 size-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p>Du bist aktuell in keiner Liga.</p>
      )}

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
