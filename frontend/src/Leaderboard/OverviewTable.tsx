function OverviewTable({ leaderboard }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th className="pr-2 pt-2 text-left"></th>
          <th className="pr-2 pt-2 text-left">Name</th>
          <th className="pr-2 pt-2 text-center">Punkte</th>
          <th className="pr-2 pt-2 text-center">Sieger</th>
          <th className="pr-2 pt-2 text-center">+-0</th>
          <th className="pr-2 pt-2 text-center">+-3</th>
          <th className="pr-2 pt-2 text-center">+-6</th>
          <th className="pr-2 pt-2 text-center">🌟</th>
        </tr>
      </thead>
      <tbody className="lb-body">
        {leaderboard.map((l, i, lb) => (
          <tr key={`LB-${l.name}`}>
            <td className="pr-2 pt-2">
              {i && lb[i - 1].points === lb[i].points ? "" : `${i + 1}.`}
            </td>
            <td className="pr-2 pt-2">{l.name}</td>
            <td className="pr-2 pt-2 text-center">{l.points}</td>
            <td className="pr-2 pt-2 text-center">
              {l.correct}/{l.total}
              <br />
              {((l.correct / l.total) * 100).toFixed(0)}%
            </td>
            <td className="pr-2 pt-2 text-center">
              {l.exact}/{l.total}
              <br /> {((l.exact / l.total) * 100).toFixed(0)}%
            </td>
            <td className="pr-2 pt-2 text-center">
              {l.offThree}/{l.total}
              <br />
              {((l.offThree / l.total) * 100).toFixed(0)}%
            </td>
            <td className="pr-2 pt-2 text-center">
              {l.offSix}/{l.total}
              <br /> {((l.offSix / l.total) * 100).toFixed(0)}%
            </td>
            <td className="pr-2 pt-2 text-center">{l.doubler}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface Props {
  leaderboard: ILeaderboard[];
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

export default OverviewTable;
