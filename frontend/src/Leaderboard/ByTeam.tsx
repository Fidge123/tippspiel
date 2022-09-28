import { useRecoilValue } from "recoil";
import { leaderboardState, teamsState, weeksState } from "../State/states";

function ByTeam() {
  const leaderboard = useRecoilValue(leaderboardState);
  const teams = [...useRecoilValue(teamsState)].sort((a, b) =>
    a.shortName.localeCompare(b.shortName)
  );
  const schedule = useRecoilValue(weeksState);
  const games = schedule.flatMap((w) => w.games);
  const prefix = process.env.REACT_APP_IMG_URL;

  function createCell<T extends { points: number; bet: any }>(
    list: T[],
    key?: string
  ) {
    const winFn = (bet: T) => bet.points > 0;
    const lossFn = (bet: T) => bet.points < 0;
    const tieFn = (bet: T) => bet.points === 0;
    return (
      <td key={key}>
        {list.filter(winFn).length}-{list.filter(lossFn).length}
        {list.filter(tieFn).length > 0 && `-${list.filter(tieFn).length}`}
        <br />
        {list.reduce((sum, bet) => sum + bet.points, 0)} Punkte
        <br />
        {list.length > 0 &&
          `⌀ ${(
            list.reduce((sum, bet) => sum + bet.bet?.pointDiff, 0) / list.length
          ).toFixed(1)} Einsatz`}
      </td>
    );
  }

  return (
    <table className="table-fixed">
      <thead>
        <tr>
          <th>Name</th>
          <th className="w-32">Home</th>
          <th className="w-32">Away</th>
          {teams.map((team) => (
            <th key={team.id} className="w-32 truncate">
              <img
                src={prefix + team.logo}
                className="inline-block p-1"
                width="32"
                height="32"
                alt={team.name}
                onError={(event: any) => (event.target.style.display = "none")}
              ></img>
              {team.shortName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((l) => (
          <tr key={l.user.id}>
            <td>{l.user.name}</td>
            {createCell(l.bets.filter((bet) => bet.bet?.winner === "home"))}
            {createCell(l.bets.filter((bet) => bet.bet?.winner === "away"))}
            {teams.map((team) =>
              createCell(
                l.bets.filter((bet) => {
                  const el = games.find((g) => g?.id === bet.game);
                  if (bet.bet?.winner === "away") {
                    return el?.awayTeam?.id === team.id;
                  }
                  if (bet.bet?.winner === "home") {
                    return el?.homeTeam?.id === team.id;
                  }
                  return false;
                }),
                l.user.id + team.id
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ByTeam;
