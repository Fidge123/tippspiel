import { useCallback, useEffect, useRef, useState } from "react";
import "./Week.css";
import { BASE_URL } from "../api";
import { useToken } from "../useToken";

import MatchUp from "./Matchup";
import { Game, IWeek, Team } from "./types";

function Week({ week, teams }: Props) {
  const weekId = `${week.year}-${week.seasontype}-${week.week}`;
  const [token] = useToken();
  const ref = useRef<HTMLElement>(null);
  const [doubler, setDoubler] = useState<string>();
  const [hidden, setHidden] = useState(true);
  const hiddenLoaded = useRef(false);
  const doublerLoaded = useRef(false);
  const loadDoubler = useCallback(() => {
    (async () => {
      doublerLoaded.current = false;
      const response = await fetch(BASE_URL + "bet/doubler?season=2021", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: any = await response.json();
      setDoubler(
        res.find(
          ({ week: w }: any) =>
            w.week === week.week &&
            w.seasontype === week.seasontype &&
            w.year === week.year
        )?.game.id
      );
      setTimeout(() => (doublerLoaded.current = true));
    })();
  }, [token, week]);

  useEffect(() => {
    loadDoubler();
  }, [loadDoubler]);

  useEffect(() => {
    (async () => {
      if (token && doubler && week && doublerLoaded.current) {
        const res = await fetch(BASE_URL + "bet/doubler", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameID: doubler,
            week: {
              week: week.week,
              year: week.year,
              seasontype: week.seasontype,
            },
          }),
        });
        if (!res.ok) {
          loadDoubler();
        }
      }
    })();
  }, [token, doubler, week, loadDoubler]);

  useEffect(() => {
    if (new Date(week.start) < new Date() && new Date() < new Date(week.end)) {
      ref.current?.scrollIntoView();
    }
  }, [week.end, week.start]);

  const loadHidden = useCallback(() => {
    (async () => {
      hiddenLoaded.current = false;
      const response = await fetch(BASE_URL + "user/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res: any = await response.json();
      console.log(res);
      if (res.hidden && typeof res.hidden[weekId] !== "undefined") {
        setHidden(res.hidden[weekId]);
      }

      setTimeout(() => (hiddenLoaded.current = true));
    })();
  }, [token, weekId]);

  useEffect(() => {
    loadHidden();
  }, [loadHidden]);

  useEffect(() => {
    (async () => {
      if (token && weekId && hiddenLoaded.current) {
        const res = await fetch(BASE_URL + "user/hidden", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hidden,
            weekId,
          }),
        });
        if (!res.ok) {
          loadHidden();
        }
      }
    })();
  }, [hidden, token, weekId, loadHidden]);

  return (
    <article className="week" key={week.label} ref={ref}>
      <div className="weekHeader">
        <span className="label">{week.label}</span>
        {new Date(week.start) < new Date() && (
          <button
            onClick={() => setHidden(!hidden)}
            style={spoilerStyle(hidden)}
          >
            Spoilerschutz {hidden ? "an" : "aus"}
          </button>
        )}
      </div>
      {week.teamsOnBye?.length > 0 && (
        <div className="bye">
          Bye: {week.teamsOnBye.map((t) => t.shortName).join(", ")}
        </div>
      )}
      {splitByDate(week.games).map((time) => (
        <div key={time[0].date}>
          <div className="time">{formatDate(time[0].date)}</div>
          {time
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

function splitByDate(games: Game[]) {
  const result: Game[][] = [];
  return games.reduce((res, game) => {
    const idx = res.findIndex((sub) => sub[0].date === game.date);
    if (idx === -1) {
      res.push([game]);
    } else {
      res[idx].push(game);
    }
    return res;
  }, result);
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

function spoilerStyle(hidden: boolean) {
  return {
    border: "1px solid #999",
    borderRadius: ".5rem",
    color: hidden ? "#ccc" : "#999",
    backgroundColor: hidden ? "#222" : "#fff",
  };
}

interface Props {
  week: IWeek;
  teams: Team[];
}

export default Week;
