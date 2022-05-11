import { useEffect, useRef, lazy, Suspense } from "react";
import { useRecoilValue } from "recoil";

import { currentWeekState } from "../State/states";

import { IWeek } from "./types";
const MatchUp = lazy(() => import("./Matchup"));
const MatchupFallback = lazy(() => import("./MatchupFallback"));
const HideButton = lazy(() => import("./HideButton"));

function Week({ id, week }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isCurrent = useRecoilValue(currentWeekState(id));

  useEffect(() => {
    if (isCurrent) {
      ref.current?.scrollIntoView();
    }
  }, [isCurrent]);

  return (
    <article className="pt-4" key={week.label} ref={ref}>
      <div className="flex justify-between pr-6">
        <span className="text-2xl dark:text-gray-100 truncate w-52 sm:w-64 md:w-80">
          {week.label}
        </span>
        <Suspense fallback={<></>}>
          <HideButton id={id} start={new Date(week.start)}></HideButton>
        </Suspense>
      </div>
      {week.teamsOnBye && week.teamsOnBye.length > 0 && (
        <div className="pb-1.5 max-w-sm sm:max-w-md dark:text-gray-300">
          Bye: {week.teamsOnBye?.map((t) => t.shortName).join(", ")}
        </div>
      )}
      {[...new Set(week.games!.map((g) => g.date))].map((time) => (
        <div key={time}>
          <div className="text-gray-400 py-0.5 leading-none">
            {formatDate(time)}
          </div>
          {week
            .games!.filter((game) => game.date === time)
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(
              (g, idx) =>
                g && (
                  <Suspense
                    key={idx}
                    fallback={
                      <MatchupFallback weekId={id} game={g}></MatchupFallback>
                    }
                  >
                    <MatchUp weekId={id} game={g}></MatchUp>
                  </Suspense>
                )
            )}
        </div>
      ))}
    </article>
  );
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleString("de", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  id: string;
  week: IWeek;
}

export default Week;
