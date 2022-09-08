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
            <td className="text-left">{l.user.name}</td>
            <td>{l.points.bets}</td>
            <td>{l.points.divBets}</td>
            <td>{l.points.sbBet}</td>
            <td>{l.points.all}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OverviewTable;
