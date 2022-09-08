import { useRecoilValue } from "recoil";
import { leaderboardState } from "../State/states";

function ByPoints() {
  const leaderboard = useRecoilValue(leaderboardState);

  function toPercent(list: any[], fn: (el: any) => boolean) {
    return list.length
      ? `${(list.filter(fn).length / list.length) * 100}%`
      : "";
  }

  function createCell(
    list: any[],
    winFn: (el: any) => boolean = (bet) => bet.points > 0,
    lossFn: (el: any) => boolean = (bet) => bet.points < 0,
    tieFn: (el: any) => boolean = (bet) => bet.points === 0
  ) {
    return (
      <td>
        {list.filter(winFn).length}-{list.filter(lossFn).length}
        {list.filter(tieFn).length > 0 && `-${list.filter(tieFn).length}`}
        <br />
        {toPercent(list, winFn)}-{toPercent(list, lossFn)}
        {list.filter(tieFn).length > 0 && `-${toPercent(list, tieFn)}`}
      </td>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Alle</th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th>4</th>
          <th>5</th>
          <th>Bonus</th>
          <th>🌟</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((l) => (
          <tr key={l.user.id}>
            <td>{l.user.name}</td>
            {createCell(l.bets)}
            {createCell(l.bets.filter((bet) => bet.bet?.pointDiff === 1))}
            {createCell(l.bets.filter((bet) => bet.bet?.pointDiff === 2))}
            {createCell(l.bets.filter((bet) => bet.bet?.pointDiff === 3))}
            {createCell(l.bets.filter((bet) => bet.bet?.pointDiff === 4))}
            {createCell(l.bets.filter((bet) => bet.bet?.pointDiff === 5))}
            {createCell(l.bets.filter((bet) => bet.bonus))}
            {createCell(l.bets.filter((bet) => bet.doubler))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ByPoints;
