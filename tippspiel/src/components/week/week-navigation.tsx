import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { api } from "~/trpc/server";
import WeekDropdown from "./week-dropdown";

interface WeekNavigationProps {
  weekId: string;
  league: string;
  children: React.ReactNode;
}

export default async function WeekNavigation({
  weekId,
  league,
  children,
}: WeekNavigationProps) {
  const navigation = await api.week.getWeekNavigation(weekId);

  return (
    <div className="flex items-center gap-4">
      {navigation.previous ? (
        <Link
          href={`/${league}/${navigation.previous.id}`}
          className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-900 text-sm hover:bg-gray-200 focus:outline-2 focus:outline-blue-500"
        >
          <ChevronLeftIcon className="size-4" />
        </Link>
      ) : (
        <div className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-gray-400 text-sm">
          <ChevronLeftIcon className="size-4" />
        </div>
      )}

      {children}
      <WeekDropdown weeks={navigation.allWeeks} league={league} />
      {navigation.next ? (
        <Link
          href={`/${league}/${navigation.next.id}`}
          className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-900 text-sm hover:bg-gray-200 focus:outline-2 focus:outline-blue-500"
        >
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <div className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-gray-400 text-sm">
          <ChevronRightIcon className="size-4" />
        </div>
      )}
    </div>
  );
}
