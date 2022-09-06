import { useRecoilValue } from "recoil";
import { leaderboardState } from "../State/states";
import DivisionCell from "./DivisionCell";

function DivisionTable() {
  const leaderboard = useRecoilValue(leaderboardState);
  const prefix = process.env.REACT_APP_IMG_URL;
  const divisions = [
    "AFC North",
    "AFC South",
    "AFC West",
    "AFC East",
    "NFC North",
    "NFC South",
    "NFC West",
    "NFC East",
  ];

  return (
    <table>
      <thead className="lb-header">
        <tr>
          <th className="text-left">Name</th>
          {divisions.map((div) => (
            <th key={div}>{div}</th>
          ))}
          <th>SB</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((l) => (
          <tr key={l.user.id}>
            <td className="pt-2 pr-2">{l.user.name}</td>
            {divisions.map((div) => (
              <DivisionCell user={l.user.id} div={div} key={div}></DivisionCell>
            ))}
            <td className="p-1 pt-2 text-center">
              {l.sbBet?.team.logo ? (
                <img
                  src={prefix + l.sbBet?.team.logo}
                  className={`p-1 inline-block border rounded ${
                    l.sbBet.points ? "border-green-500" : "border-red-500"
                  }`}
                  width="32"
                  height="32"
                  alt="team logo for superbowl bet"
                  onError={(event: any) =>
                    (event.target.style.display = "none")
                  }
                ></img>
              ) : (
                "?"
              )}
            </td>
            <td className="pt-2 text-center cpr-2">
              {l.divBets.reduce((p, c) => p + c.points, 0) + l.sbBet.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DivisionTable;
