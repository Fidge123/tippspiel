import { useRecoilValue } from "recoil";

import OverviewTable from "./OverviewTable";
import DivisonTable from "./DivisionTable";
import Rules from "./Rules";
import { leaderboardState } from "../State/states";

function Leaderboard() {
  const leaderboard = useRecoilValue(leaderboardState);

  return (
    <div className="p-4 pt-0">
      <h1 className="text-xl">Leaderboard</h1>

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

export default Leaderboard;
