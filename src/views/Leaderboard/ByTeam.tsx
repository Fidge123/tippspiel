import type { FC } from 'hono/jsx';
import { imageUrl } from '../../config';
import type { LeaderboardEntry } from '../../leaderboard/build';
import type { LeaderboardTeam, ScheduleWeek } from '../../leaderboard/query';
import { type Bet, averageStake, count, record, totalPoints } from './stats';

/** ", 2🌟" but ", 🌟" for a single one, and nothing for none. */
function suffix(n: number, symbol: string, skipOne = false): string {
  if (n < 1) {
    return '';
  }
  return skipOne && n === 1 ? `, ${symbol}` : `, ${n}${symbol}`;
}

const Line: FC<{ bets: Bet[]; class?: string }> = ({
  bets,
  class: className = 'text-inherit',
}) => (
  <div class={className}>
    {record(bets)}
    {bets.length > 0
      ? ` (${averageStake(bets)} → ${totalPoints(bets)}${suffix(
          count(bets, (bet) => bet.bonus),
          'B',
        )}${suffix(
          count(bets, (bet) => bet.doubler),
          '🌟',
          true,
        )})`
      : ''}
  </div>
);

const SideCell: FC<{ bets: Bet[] }> = ({ bets }) => (
  <td>
    {record(bets)}
    <br />
    {bets.length > 0 ? `${averageStake(bets)} → ${totalPoints(bets)}` : ''}
  </td>
);

const TeamCell: FC<{ forTeam: Bet[]; againstTeam: Bet[] }> = ({
  forTeam,
  againstTeam,
}) => (
  <td>
    <Line bets={forTeam} class="text-green-600" />
    <Line bets={againstTeam} class="text-red-600" />
    <Line bets={[...forTeam, ...againstTeam]} class="border-t" />
  </td>
);

export const ByTeam: FC<{
  entries: LeaderboardEntry[];
  teams: LeaderboardTeam[];
  weeks: ScheduleWeek[];
}> = ({ entries, teams, weeks }) => {
  const games = new Map(
    weeks.flatMap((week) => week.games).map((game) => [game.id, game]),
  );
  const sorted = [...teams].sort((a, b) =>
    a.shortName.localeCompare(b.shortName),
  );

  const picked = (bet: Bet, teamId: string): boolean => {
    const game = games.get(bet.game);
    if (bet.bet?.winner === 'away') {
      return game?.awayTeamId === teamId;
    }
    if (bet.bet?.winner === 'home') {
      return game?.homeTeamId === teamId;
    }
    return false;
  };

  const pickedAgainst = (bet: Bet, teamId: string): boolean => {
    const game = games.get(bet.game);
    if (bet.bet?.winner === 'home') {
      return game?.awayTeamId === teamId;
    }
    if (bet.bet?.winner === 'away') {
      return game?.homeTeamId === teamId;
    }
    return false;
  };

  return (
    <div>
      <div class="py-2 max-w-prose">
        Die Statistik in <span class="text-green-600"> grün </span> ist für
        Tipps bei denen dieses Team als Sieger gewählt wurde, in
        <span class="text-red-600"> rot </span> sind Tipps bei denen der Gegner
        als Sieger gewählt wurde. In Klammern wird der durchschnittliche
        Einsatz, der summierte Erlös, die Anzahl der Doppler (🌟) und
        Bonuspunkte (B) angezeigt.
      </div>
      <table class="table-fixed">
        <thead>
          <tr>
            <th class="w-32">Name</th>
            <th class="w-42">Home</th>
            <th class="w-42">Away</th>
            {sorted.map((team) => (
              <th class="truncate w-42">
                <img
                  src={`${imageUrl}${team.logo}`}
                  class="inline-block p-1"
                  width="32"
                  height="32"
                  alt={team.name}
                />
                {team.shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr>
              <td>{entry.user.name}</td>
              <SideCell
                bets={entry.bets.filter((bet) => bet.bet?.winner === 'home')}
              />
              <SideCell
                bets={entry.bets.filter((bet) => bet.bet?.winner === 'away')}
              />
              {sorted.map((team) => (
                <TeamCell
                  forTeam={entry.bets.filter((bet) => picked(bet, team.id))}
                  againstTeam={entry.bets.filter((bet) =>
                    pickedAgainst(bet, team.id),
                  )}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
