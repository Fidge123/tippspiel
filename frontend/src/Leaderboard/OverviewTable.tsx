function OverviewTable({ leaderboard }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th className="text-left"></th>
          <th className="text-left">Name</th>
          <th>Punkte</th>
          <th>Sieger</th>
          <th>+-0</th>
          <th>+-3</th>
          <th>+-6</th>
          <th>🌟</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((l, i, lb) => (
          <tr key={`LB-${l.name}`}>
            <td>{i && lb[i - 1].points === lb[i].points ? "" : `${i + 1}.`}</td>
            <td>{l.name}</td>
            <td className="text-center">{l.points}</td>
            <td className="text-center">
              {l.correct}/{l.total}
              <br />
              {((l.correct / l.total) * 100).toFixed(0)}%
            </td>
            <td className="text-center">
              {l.exact}/{l.total}
              <br /> {((l.exact / l.total) * 100).toFixed(0)}%
            </td>
            <td className="text-center">
              {l.offThree}/{l.total}
              <br />
              {((l.offThree / l.total) * 100).toFixed(0)}%
            </td>
            <td className="text-center">
              {l.offSix}/{l.total}
              <br /> {((l.offSix / l.total) * 100).toFixed(0)}%
            </td>
            <td className="text-center">{l.doubler}</td>
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
  sbBet: {
    logo: string;
    points: number;
  };
}

export default OverviewTable;
