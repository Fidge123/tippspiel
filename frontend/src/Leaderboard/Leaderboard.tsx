import { useRecoilValue } from "recoil";

import OverviewTable from "./OverviewTable";
import DivisonTable from "./DivisionTable";
import { leaderboardState } from "../State/states";

function Leaderboard() {
  const leaderboard = useRecoilValue(leaderboardState);

  return (
    <div className="p-4 pt-0">
      <h1 className="text-xl">Leaderboard</h1>

      <div className="w-full mt-4 mb-12 overflow-x-auto">
        <OverviewTable leaderboard={leaderboard}></OverviewTable>
      </div>
      <div className="w-full mt-4 mb-12 overflow-x-auto">
        <DivisonTable leaderboard={leaderboard}></DivisonTable>
      </div>
    </div>
  );
}

export default Leaderboard;
