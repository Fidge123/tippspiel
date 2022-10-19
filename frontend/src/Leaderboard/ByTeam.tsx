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

  const winFn = (bet: any) => bet.points > 0;
  const lossFn = (bet: any) => bet.points < 0;
  const tieFn = (bet: any) => bet.points === 0;

  function displayDoubler(doublerCount: number): string {
    if (doublerCount < 1) {
      return "";
    }
    if (doublerCount === 1) {
      return ", 🌟";
    }
    if (doublerCount === 2) {
      return ", 🌟🌟";
    }
    return `, ${doublerCount}🌟`;
  }

  function createLine<T extends { points: number; bet: any; doubler: boolean }>(
    list: T[],
    className: string = "text-inherit"
  ) {
    const doublerCount = list.reduce(
      (sum, bet) => (bet.doubler ? sum + 1 : sum),
      0
    );
    return (
      <div className={className}>
        {list.filter(winFn).length}-{list.filter(lossFn).length}
        {list.filter(tieFn).length > 0 && `-${list.filter(tieFn).length}`}
        {list.length > 0 &&
          ` (${
            Math.round(
              (10 * list.reduce((sum, bet) => sum + bet.bet?.pointDiff, 0)) /
                list.length
            ) / 10
          } → ${list.reduce((sum, bet) => sum + bet.points, 0)}${displayDoubler(
            doublerCount
          )})`}
      </div>
    );
  }

  function createCell<T extends { points: number; bet: any; doubler: boolean }>(
    listFor: T[],
    listAgainst?: T[],
    key?: string
  ) {
    if (!listAgainst) {
      return (
        <td key={key}>
          {listFor.filter(winFn).length}-{listFor.filter(lossFn).length}
          {listFor.filter(tieFn).length > 0 &&
            `-${listFor.filter(tieFn).length}`}
          <br />
          {listFor.length > 0 &&
            `${
              Math.round(
                (10 *
                  listFor.reduce((sum, bet) => sum + bet.bet?.pointDiff, 0)) /
                  listFor.length
              ) / 10
            } → ${listFor.reduce((sum, bet) => sum + bet.points, 0)}`}
        </td>
      );
    }

    return (
      <td key={key}>
        {createLine(listFor, "text-green-600")}
        {createLine(listAgainst, "text-red-600")}
        {createLine([...listFor, ...listAgainst], "border-t")}
      </td>
    );
  }

  return (
    <div>
      <div className="py-2 max-w-prose">
        Die Statistik in <span className="text-green-600"> grün </span> ist für
        Tipps bei denen dieses Team als Sieger gewählt wurde, in
        <span className="text-red-600"> rot </span> sind Tipps bei denen der
        Gegner als Sieger gewählt wurde. In Klammern wird der durchschnittliche
        Einsatz, der summierte Erlös und die Anzahl der Doppler angezeigt.
      </div>
      <table className="table-fixed">
        <thead>
          <tr>
            <th className="w-32">Name</th>
            <th className="w-42">Home</th>
            <th className="w-42">Away</th>
            {teams.map((team) => (
              <th key={team.id} className="truncate w-42">
                <img
                  src={prefix + team.logo}
                  className="inline-block p-1"
                  width="32"
                  height="32"
                  alt={team.name}
                  onError={(event: any) =>
                    (event.target.style.display = "none")
                  }
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
                  l.bets.filter((bet) => {
                    const el = games.find((g) => g?.id === bet.game);
                    if (bet.bet?.winner === "home") {
                      return el?.awayTeam?.id === team.id;
                    }
                    if (bet.bet?.winner === "away") {
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
    </div>
  );
}

export default ByTeam;
