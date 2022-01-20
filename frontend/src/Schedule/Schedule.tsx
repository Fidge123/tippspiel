import { useEffect, useState } from "react";
import { useRecoilValue, useRecoilCallback, useSetRecoilState } from "recoil";

import {
  tokenState,
  gameBetsState,
  statsState,
  doublerState,
  userState,
  weeksState,
} from "../State/states";
import { Bet, Stat, Doubler } from "../State/response-types";
import { IWeek } from "./types";
import { fetchFromAPI } from "../api";
import Week from "./Week";

function Schedule() {
  const token = useRecoilValue(tokenState);
  const setUserState = useSetRecoilState(userState);
  const weeks = useRecoilValue(weeksState);
  const setBet = useRecoilCallback(({ set }) => (gameId: string, bet: Bet) => {
    set(gameBetsState(gameId), bet);
  });
  const setStat = useRecoilCallback(
    ({ set }) =>
      (gameId: string, stat: Stat[]) => {
        set(statsState(gameId), stat);
      }
  );
  const setDoubler = useRecoilCallback(
    ({ set }) =>
      ({ week, seasontype, year }: IWeek, doubler: string) => {
        set(doublerState([week, seasontype, year]), doubler);
      }
  );

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      Promise.all([
        fetchFromAPI("leaderboard/games?season=2021", token),
        fetchFromAPI("bet?season=2021", token),
        fetchFromAPI<Doubler[]>("bet/doubler?season=2021", token),
      ]).then(([stats, bets, doubler]) => {
        Object.entries<Stat[]>(stats).forEach(([id, stat]) =>
          setStat(id, stat)
        );
        Object.entries<Bet>(bets).forEach(([id, bet]) => setBet(id, bet));
        doubler.forEach((d) => setDoubler(d.week, d.game.id));
      });
    }
    setInitialized(true);
  }, [token, setStat, setBet, setDoubler, setUserState, initialized]);

  return (
    <section className="grid gap-x-2 sm:gap-x-4 grid-cols-23 sm:grid-cols-27 md:grid-cols-45 gap-y-12 justify-items-center px-1 pb-8 min-w-min">
      {weeks.map((week, i) => (
        <Week week={week} key={`Week-${i}`}></Week>
      ))}
    </section>
  );
}

export default Schedule;
