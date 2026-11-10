import type { FC } from 'hono/jsx';
import type { LeaderboardEntry } from '../../leaderboard/build';
import { type Bet, percentages, record } from './stats';

const Cell: FC<{ bets: Bet[] }> = ({ bets }) => (
  <td>
    {record(bets)}
    <br />
    {percentages(bets)}
  </td>
);

export const ByPoints: FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Alle</th>
        <th>Kein</th>
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
      {entries.map((entry) => (
        <tr>
          <td>{entry.user.name}</td>
          <Cell bets={entry.bets} />
          <Cell bets={entry.bets.filter((bet) => !bet.bet)} />
          {[1, 2, 3, 4, 5].map((stake) => (
            <Cell
              bets={entry.bets.filter((bet) => bet.bet?.pointDiff === stake)}
            />
          ))}
          <Cell bets={entry.bets.filter((bet) => bet.bonus)} />
          <Cell bets={entry.bets.filter((bet) => bet.doubler)} />
        </tr>
      ))}
    </tbody>
  </table>
);
