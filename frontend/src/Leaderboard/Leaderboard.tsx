import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import OverviewTable from "./OverviewTable";
import DivisonTable from "./DivisionTable";
import Rules from "./Rules";

import { tokenState } from "../State/states";
import { fetchFromAPI } from "../api";

function sum(list: number[]) {
  return list.reduce((a, b) => a + b, 0);
}

function Leaderboard() {
  const token = useRecoilValue(tokenState);
  const [leaderboard, setLeaderboard] = useState<ILeaderboard[]>([]);

  function formatBet(bet: any) {
    return {
      logo: bet?.team?.logo
        ? process.env.REACT_APP_IMG_URL + bet?.team?.logo
        : null,
      points: bet?.points || 0,
    };
  }

  useEffect(() => {
    (async () => {
      const res: LBResponse[] = await fetchFromAPI("leaderboard/2021", token); //TODO

      setLeaderboard(
        res
          .map((user) => ({
            name: user.user,
            points:
              user.bets.reduce((prev, { points }) => prev + sum(points), 0) +
              user.divBets.reduce((p, c) => p + c.points, 0) +
              user.sbBet.points,
            correct: user.bets.reduce(
              (a, b) => (b.points[0] > 0 ? a + 1 : a),
              0
            ),
            exact: user.bets.reduce((a, b) => (b.points[1] > 0 ? a + 1 : a), 0),
            offThree: user.bets.reduce(
              (a, b) => (b.points[2] > 0 ? a + 1 : a),
              0
            ),
            offSix: user.bets.reduce(
              (a, b) => (b.points[3] > 0 ? a + 1 : a),
              0
            ),
            doubler: user.bets.reduce(
              (a, b) =>
                b.points[0] === 4
                  ? a + b.points.reduce((a, b) => a + b) / 2
                  : a,
              0
            ),
            total: user.bets.length,
            divBets: [
              formatBet(user.divBets.find((bet) => bet.name === "AFC North")),
              formatBet(user.divBets.find((bet) => bet.name === "AFC South")),
              formatBet(user.divBets.find((bet) => bet.name === "AFC West")),
              formatBet(user.divBets.find((bet) => bet.name === "AFC East")),
              formatBet(user.divBets.find((bet) => bet.name === "NFC North")),
              formatBet(user.divBets.find((bet) => bet.name === "NFC South")),
              formatBet(user.divBets.find((bet) => bet.name === "NFC West")),
              formatBet(user.divBets.find((bet) => bet.name === "NFC East")),
            ],
            sbBet: formatBet(user.sbBet),
          }))
          .sort((a, b) =>
            a.points === b.points ? b.total - a.total : b.points - a.points
          )
      );
    })();
  }, [token]);

  return (
    <div className="p-4 pt-0">
      <h2 className="text-xl">Leaderboard</h2>

      <div className="mt-4 mb-12 w-full overflow-x-auto">
        <OverviewTable leaderboard={leaderboard}></OverviewTable>
      </div>
      <div className="mt-4 mb-12 w-full overflow-x-auto">
        <DivisonTable leaderboard={leaderboard}></DivisonTable>
      </div>
      <Rules></Rules>
    </div>
  );
}

interface ILeaderboard {
  name: string;
  points: number;
  correct: number;
  exact: number;
  offThree: number;
  offSix: number;
  doubler: number;
  total: number;
  divBets: {
    logo: string;
    points: number;
  }[];
  sbBet: {
    logo: string;
    points: number;
  };
}

interface LBResponse {
  user: string;
  bets: {
    id: string;
    points: number[];
  }[];
  divBets: {
    name: string;
    points: number;
    team: {
      id: string;
      name: string;
      abbreviation: string;
      logo: string;
      playoffSeed: number;
    };
  }[];
  sbBet: {
    points: number;
    team: {
      id: string;
      name: string;
      abbreviation: string;
      logo: string;
      playoffSeed: number;
    };
  };
}

export default Leaderboard;
