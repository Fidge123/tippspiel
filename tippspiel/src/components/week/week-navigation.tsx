import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { api } from "~/trpc/server";
import { NavButton } from "./nav-button";
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
  const [navigation, currentWeek] = await Promise.all([
    api.week.getWeekNavigation(weekId),
    api.week.getCurrentWeek(),
  ]);
  const prev = navigation.previous
    ? `/${league}/${navigation.previous?.id}`
    : undefined;
  const next = navigation.next
    ? `/${league}/${navigation.next?.id}`
    : undefined;

  return (
    <div className="flex items-center gap-4">
      <NavButton title="Previous Week" href={prev}>
        <ChevronLeftIcon className="size-4" />
      </NavButton>
      {children}
      <WeekDropdown
        weeks={navigation.allWeeks}
        league={league}
        currentWeek={currentWeek?.id}
      />
      <NavButton title="Next Week" href={next}>
        <ChevronRightIcon className="size-4" />
      </NavButton>
    </div>
  );
}
