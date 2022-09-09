import { useRecoilValue } from "recoil";
import { leaderboardState } from "../State/states";

function OverviewTable() {
  const leaderboard = useRecoilValue(leaderboardState);

  return (
    <table>
      <colgroup>
        <col span={1}></col>
        <col span={1}></col>
        <col className="sm:w-24" span={4}></col>
      </colgroup>
      <thead>
        <tr>
          <th></th>
          <th className="text-left">Name</th>
          <th scope="col">Spiele</th>
          <th scope="col" className="sm:hidden">
            Divs
          </th>
          <th scope="col" className="hidden sm:table-cell">
            Divisions
          </th>
          <th scope="col">SB</th>
          <th scope="col">Summe</th>
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
