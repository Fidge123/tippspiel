import type { FC } from 'hono/jsx';
import type { LeaderboardEntry } from '../../leaderboard/build';

export const OverviewTable: FC<{ entries: LeaderboardEntry[] }> = ({
  entries,
}) => (
  <table>
    <colgroup>
      <col span={1} />
      <col span={1} />
      <col class="sm:w-24" span={4} />
    </colgroup>
    <thead>
      <tr>
        <th />
        <th class="text-left">Name</th>
        <th scope="col">Spiele</th>
        <th scope="col" class="sm:hidden">
          Divs
        </th>
        <th scope="col" class="hidden sm:table-cell">
          Divisions
        </th>
        <th scope="col">SB</th>
        <th scope="col">Summe</th>
      </tr>
    </thead>
    <tbody>
      {entries.map((entry, index) => (
        <tr>
          <td>
            {index && entries[index - 1].points.all === entry.points.all
              ? ''
              : `${index + 1}.`}
          </td>
          <td class="text-left">{entry.user.name}</td>
          <td>{entry.points.bets}</td>
          <td>{entry.points.divBets}</td>
          <td>{entry.points.sbBet}</td>
          <td>{entry.points.all}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
