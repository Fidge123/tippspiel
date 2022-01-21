import { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { doublerState, teamsState, hiddenState } from "../State/states";

import MatchUp from "./Matchup";
import { IWeek } from "./types";

function Week({ week }: Props) {
  const weekId = `${week.year}-${week.seasontype}-${week.week}`;
  const ref = useRef<HTMLElement>(null);
  const [doubler, setDoubler] = useRecoilState(doublerState(weekId));
  const teams = useRecoilValue(teamsState);
  const [hidden, setHidden] = useRecoilState(hiddenState(weekId));

  useEffect(() => {
    if (new Date(week.start) < new Date() && new Date() < new Date(week.end)) {
      ref.current?.scrollIntoView();
    }
  }, [week.end, week.start]);

  return (
    <article className="pt-4" key={week.label} ref={ref}>
      <div className="flex justify-between pr-6">
        <span className="text-2xl dark:text-gray-100">{week.label}</span>
        {new Date(week.start) < new Date() && (
          <button
            onClick={() => setHidden(!hidden)}
            className={`border border-gray-800 dark:border-black rounded ${
              hidden
                ? "text-white dark:text-white bg-gray-600 dark:bg-gray-900"
                : "text-gray-800 dark:text-gray-900 bg-gray-100 dark:bg-gray-400"
            }`}
          >
            Spoilerschutz {hidden ? "an" : "aus"}
          </button>
        )}
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
                  <MatchUp
                    key={idx}
                    game={g}
                    doubler={doubler === g.id}
                    setDoubler={setDoubler}
                    home={teams.find((t) => t.id === g.homeTeam?.id)}
                    away={teams.find((t) => t.id === g.awayTeam?.id)}
                    hidden={hidden}
                  ></MatchUp>
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
  week: IWeek;
}

export default Week;
