import type { FC } from 'hono/jsx';
import type { LeaderboardEntry } from '../../leaderboard/build';
import type { ScheduleWeek } from '../../leaderboard/query';
import { type Bet, averageStake, record, totalPoints } from './stats';

const Cell: FC<{ bets: Bet[] }> = ({ bets }) =>
  bets.length ? (
    <td>
      {record(bets)}
      <div>{`⌀ ${averageStake(bets)} Einsatz`}</div>
      <div>{totalPoints(bets)} Punkte</div>
    </td>
  ) : (
    <td />
  );

export const ByWeek: FC<{
  entries: LeaderboardEntry[];
  weeks: ScheduleWeek[];
}> = ({ entries, weeks }) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        {weeks.map((week) => (
          <th>{week.label}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {entries.map((entry) => (
        <tr>
          <td>{entry.user.name}</td>
          {weeks.map((week) => (
            <Cell
              bets={entry.bets.filter((bet) =>
                week.games.some((game) => game.id === bet.game),
              )}
            />
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
