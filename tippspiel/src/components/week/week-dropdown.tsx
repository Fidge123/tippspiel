import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { api } from "~/trpc/server";

interface Week {
  id: string;
  createdAt: string;
  updatedAt: string;
  season: number;
  start: string | null;
  end: string | null;
  week: string;
  stage: string;
}

interface WeekDropdownProps {
  weeks: Week[];
  league: string;
}

export default async function WeekDropdown({
  weeks,
  league,
}: WeekDropdownProps) {
  const currentWeek = await api.week.getCurrentWeek();
  return (
    <Menu>
      <MenuButton className="rounded-md p-1 text-gray-600 transition-colors hover:bg-gray-100/50 hover:text-gray-900 focus:outline-2 focus:outline-blue-500 active:bg-gray-200/50">
        <ChevronDownIcon className="size-5" />
      </MenuButton>
      <MenuItems
        anchor="bottom"
        transition
        className="mt-2 rounded-lg border border-gray-200 bg-white/70 shadow-lg backdrop-blur transition focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        <ul className="max-h-64 min-w-48 overflow-auto">
          {weeks.map((week) => (
            <MenuItem key={week.id} as="li">
              <Link
                href={`/${league}/${week.id}`}
                className={`block px-4 py-2 text-sm transition-colors hover:font-bold ${week.id === currentWeek?.id ? "bg-blue-50/50 text-blue-600" : "text-gray-900"}`}
              >
                {week.week}
              </Link>
            </MenuItem>
          ))}
        </ul>
      </MenuItems>
    </Menu>
  );
}
