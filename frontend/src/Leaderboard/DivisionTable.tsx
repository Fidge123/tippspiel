function DivisionTable({ leaderboard }: Props) {
  return (
    <table>
      <thead className="lb-header">
        <tr>
          <th className="text-left">Name</th>
          <th className="text-center px-2">AFC North</th>
          <th className="text-center px-2">AFC South</th>
          <th className="text-center px-2">AFC West</th>
          <th className="text-center px-2">AFC East</th>
          <th className="text-center px-2">NFC North</th>
          <th className="text-center px-2">NFC South</th>
          <th className="text-center px-2">NFC West</th>
          <th className="text-center px-2">NFC East</th>
          <th className="text-center px-2">SB</th>
          <th className="text-center px-2">Points</th>
        </tr>
      </thead>
      <tbody className="lb-body">
        {leaderboard.map((l) => (
          <tr key={`LB-${l.name}`}>
            <td className="pr-2 pt-2">{l.name}</td>
            {l.divBets.map((bet, i) => (
              <td key={"divbet" + i} className="p-1 pt-2 text-center">
                {bet?.logo && (
                  <img
                    src={bet?.logo}
                    className={`h-8 w-8 p-1 inline-block border rounded ${
                      bet.points ? "border-green-500" : "border-red-500"
                    }`}
                    alt="team logo for division bet"
                    onError={(event: any) =>
                      (event.target.style.display = "none")
                    }
                  ></img>
                )}
                {bet?.logo === null && "?"}
              </td>
            ))}
            <td className="p-1 pt-2 text-center">
              {l.sbBet?.logo && (
                <img
                  src={l.sbBet?.logo}
                  className={`h-8 w-8 p-1 inline-block border rounded ${
                    l.sbBet.points ? "border-green-500" : "border-red-500"
                  }`}
                  alt="team logo for superbowl bet"
                  onError={(event: any) =>
                    (event.target.style.display = "none")
                  }
                ></img>
              )}
              {l.sbBet?.logo === null && "?"}
            </td>
            <td className="cpr-2 pt-2 text-center">
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
    logo: string;
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
