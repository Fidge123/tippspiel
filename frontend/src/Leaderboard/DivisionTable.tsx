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
    <table className="table-fixed">
      <thead>
        <tr>
          <th>Name</th>
          {divisions.map((div) => (
            <th key={div}>{div}</th>
          ))}
          <th>SB</th>
          <th>Punkte</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((l) => (
          <tr key={l.user.id}>
            <td>{l.user.name}</td>
            {divisions.map((div) => (
              <DivisionCell user={l.user.id} div={div} key={div}></DivisionCell>
            ))}
            <td>
              {l.sbBet?.team.logo ? (
                <img
                  src={prefix + l.sbBet?.team.logo}
                  className={`p-1 inline-block ${
                    l.sbBet.points ? "border-green-500 border rounded" : ""
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
            <td>
              {l.divBets.reduce((p, c) => p + c.points, 0) + l.sbBet.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DivisionTable;
