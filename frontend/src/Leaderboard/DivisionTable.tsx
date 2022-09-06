function DivisionTable({ leaderboard }: Props) {
  return (
    <table>
      <thead className="lb-header">
        <tr>
          <th className="text-left">Name</th>
          <th>AFC North</th>
          <th>AFC South</th>
          <th>AFC West</th>
          <th>AFC East</th>
          <th>NFC North</th>
          <th>NFC South</th>
          <th>NFC West</th>
          <th>NFC East</th>
          <th>SB</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((l) => (
          <tr key={`LB-${l.name}`}>
            <td className="pt-2 pr-2">{l.name}</td>
            {l.divBets.map((bet, i) => (
              <td key={"divbet" + i}>
                <div className="flex flex-col items-center">
                  {bet?.first?.logo ? (
                    <img
                      src={bet.first.logo}
                      className={`p-1 inline-block border rounded ${
                        bet.points ? "border-green-500" : "border-red-500"
                      }`}
                      width="32"
                      height="32"
                      alt="team logo for division bet"
                      onError={(event: any) =>
                        (event.target.style.display = "none")
                      }
                    ></img>
                  ) : (
                    "?"
                  )}
                  {bet?.second?.logo ? (
                    <img
                      src={bet.second.logo}
                      className={`p-1 inline-block border rounded ${
                        bet.points ? "border-green-500" : "border-red-500"
                      }`}
                      width="32"
                      height="32"
                      alt="team logo for division bet"
                      onError={(event: any) =>
                        (event.target.style.display = "none")
                      }
                    ></img>
                  ) : (
                    "?"
                  )}
                  {bet?.third?.logo ? (
                    <img
                      src={bet.third.logo}
                      className={`p-1 inline-block border rounded ${
                        bet.points ? "border-green-500" : "border-red-500"
                      }`}
                      width="32"
                      height="32"
                      alt="team logo for division bet"
                      onError={(event: any) =>
                        (event.target.style.display = "none")
                      }
                    ></img>
                  ) : (
                    "?"
                  )}
                  {bet?.fourth?.logo ? (
                    <img
                      src={bet.fourth.logo}
                      className={`p-1 inline-block border rounded ${
                        bet.points ? "border-green-500" : "border-red-500"
                      }`}
                      width="32"
                      height="32"
                      alt="team logo for division bet"
                      onError={(event: any) =>
                        (event.target.style.display = "none")
                      }
                    ></img>
                  ) : (
                    "?"
                  )}
                </div>
              </td>
            ))}
            <td className="p-1 pt-2 text-center">
              {l.sbBet?.logo && (
                <img
                  src={l.sbBet?.logo}
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
              )}
              {l.sbBet?.logo === null && "?"}
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
    first: { logo?: string };
    second: { logo?: string };
    third: { logo?: string };
    fourth: { logo?: string };
    points: number;
  }[];
  sbBet: {
    logo: string;
    points: number;
  };
}

interface Props {
  leaderboard: ILeaderboard[];
}

export default DivisionTable;
