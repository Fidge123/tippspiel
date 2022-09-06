import { useRecoilValue } from "recoil";
import { leaderboardState } from "../State/states";

function OverviewTable() {
  const leaderboard = useRecoilValue(leaderboardState);

  return (
    <table>
      <thead>
        <tr>
          <th className="text-left"></th>
          <th className="text-left">Name</th>
          <th>Spiele</th>
          <th>Division</th>
          <th>Superbowl</th>
          <th>Punkte</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((l, i, lb) => (
          <tr key={l.user.id}>
            <td>
              {i && lb[i - 1].points.all === lb[i].points.all
                ? ""
                : `${i + 1}.`}
            </td>
            <td>{l.user.name}</td>
            <td className="text-center">{l.points.bets}</td>
            <td className="text-center">{l.points.divBets}</td>
            <td className="text-center">{l.points.sbBet}</td>
            <td className="text-center">{l.points.all}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OverviewTable;
