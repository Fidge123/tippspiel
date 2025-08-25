import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { api } from "~/trpc/server";

export default async function LeagueSelector({ selected }: Props) {
  const leagues = await api.league.getLeaguesForDropdown();
  const selectedLeague = leagues.find((l) => l.id === selected);

  if (!leagues || leagues.length === 0) {
    return null;
  }

  return (
    <Listbox>
      <div className="relative">
        <ListboxButton className="flex h-8 items-center gap-1 rounded bg-gray-700 px-3 font-medium text-sm text-white hover:bg-gray-600 focus:bg-gray-600 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2">
          <span className="truncate">
            {selectedLeague
              ? `${selectedLeague.name} (${selectedLeague.season})`
              : "Liga wählen"}
          </span>
          <ChevronDownIcon
            className="size-4 text-gray-300"
            aria-hidden="true"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute right-0 z-10 mt-1 max-h-60 min-w-48 overflow-auto rounded-lg bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-gray-700 transition focus:outline-none data-closed:scale-95 data-closed:opacity-0"
        >
          {leagues.map((league) => (
            <ListboxOption
              key={league.id}
              value={league.id}
              className="cursor-pointer select-none px-3 py-2 text-white hover:bg-gray-700 data-selected:bg-gray-700"
            >
              <div className="flex flex-col">
                <span className="font-medium">{league.name}</span>
                <span className="text-gray-400 text-xs">
                  Saison {league.season}
                </span>
              </div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

interface Props {
  selected: string;
}
