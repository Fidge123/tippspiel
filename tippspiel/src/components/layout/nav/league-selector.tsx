import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { api } from "~/trpc/server";

export default async function LeagueSelector({ selected, suffix }: Props) {
  const leagues = await api.league.getLeaguesForDropdown();
  const selectedLeague = leagues.find((l) => l.id === selected);

  if (!leagues || leagues.length === 0) {
    return null;
  }

  return (
    <Menu>
      <MenuButton className="flex h-8 items-center gap-1 rounded bg-gray-700 px-3 font-medium text-sm text-white hover:bg-gray-600 focus:bg-gray-600 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2">
        <span className="truncate">
          {selectedLeague
            ? `${selectedLeague.name} (${selectedLeague.season})`
            : "Liga wählen"}
        </span>
        <ChevronDownIcon className="size-4 text-gray-300" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        anchor="bottom"
        transition
        className="mt-1 max-h-60 min-w-48 overflow-auto rounded-lg bg-gray-800 shadow-lg transition focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        {leagues.map((league) => (
          <MenuItem key={league.id}>
            <Link
              href={`/${league.id}/${suffix}`}
              className="flex flex-col px-3 py-2 text-sm text-white hover:bg-gray-700 data-selected:bg-gray-700"
            >
              <span>{league.name}</span>
              <span className="text-gray-400 text-xs">
                Saison {league.season}
              </span>
            </Link>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

interface Props {
  selected: string;
  suffix: string;
}
