import { useRecoilValue } from "recoil";
import { leaderboardState, weeksState } from "../State/states";

function ByWeek() {
  const leaderboard = useRecoilValue(leaderboardState);
  const weeks = useRecoilValue(weeksState);

  function createCell<T extends { points: number }>(list: T[], key?: string) {
    const winFn = (bet: T) => bet.points > 0;
    const lossFn = (bet: T) => bet.points < 0;
    const tieFn = (bet: T) => bet.points === 0;

    return (
      <td key={key}>
        {list.filter(winFn).length}-{list.filter(lossFn).length}
        {list.filter(tieFn).length > 0 && `-${list.filter(tieFn).length}`}
        <br />
        {list.reduce((sum, bet) => sum + bet.points, 0)} Punkte
      </td>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          {weeks.map((week) => (
            <th key={week.id}>{week.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((l) => (
          <tr key={l.user.id}>
            <td>{l.user.name}</td>
            {weeks.map((week) =>
              createCell(
                l.bets.filter((bet) =>
                  week.games?.some((g) => g?.id === bet.game)
                ),
                l.user.id + week.id
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ByWeek;
