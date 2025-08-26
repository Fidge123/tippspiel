import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { api } from "~/trpc/server";

export async function LeagueSelectorMenu({ selected, currentPath }: Props) {
  const leagues = await api.league.getLeaguesForDropdown();
  const selectedLeague = leagues.find((l) => l.id === selected);

  if (!leagues || leagues.length === 0) {
    return null;
  }

  // Build URLs by replacing the league ID in the current path
  const buildLeagueUrl = (leagueId: string) => {
    // Split the current path and replace the first segment (league ID)
    const segments = currentPath.split("/").filter(Boolean);
    if (segments.length > 0) {
      segments[0] = leagueId;
      return `/${segments.join("/")}`;
    }
    return `/${leagueId}`;
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex h-8 items-center gap-1 rounded bg-gray-700 px-3 font-medium text-sm text-white hover:bg-gray-600 focus:bg-gray-600 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2">
        <span className="truncate">
          {selectedLeague
            ? `${selectedLeague.name} (${selectedLeague.season})`
            : "Liga wählen"}
        </span>
        <ChevronDownIcon className="size-4 text-gray-300" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-1 max-h-60 min-w-48 overflow-auto rounded-lg bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-gray-700 transition focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        {leagues.map((league) => (
          <MenuItem key={league.id}>
            <Link
              href={buildLeagueUrl(league.id)}
              className="block w-full cursor-pointer select-none px-3 py-2 text-white hover:bg-gray-700 data-[focus]:bg-gray-700"
            >
              <div className="flex flex-col">
                <span className="font-medium">{league.name}</span>
                <span className="text-gray-400 text-xs">
                  Saison {league.season}
                </span>
              </div>
            </Link>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

interface Props {
  selected: string;
  currentPath: string;
}
