import type { FC } from 'hono/jsx';
import type { LeaderboardEntry } from '../../leaderboard/build';
import type { LeaderboardTeam } from '../../leaderboard/query';
import { imageUrl } from '../../config';

const DIVISIONS = [
  'AFC North',
  'AFC South',
  'AFC West',
  'AFC East',
  'NFC North',
  'NFC South',
  'NFC West',
  'NFC East',
];

const TeamLogo: FC<{ team: LeaderboardTeam | null; correct: boolean }> = ({
  team,
  correct,
}) =>
  team?.logo ? (
    <img
      src={`${imageUrl}${team.logo}`}
      class={`p-1 inline-block ${correct ? 'border-green-500 border rounded' : ''}`}
      width="32"
      height="32"
      alt={team.abbreviation}
    />
  ) : (
    <span>?</span>
  );

const seedOf = (team: LeaderboardTeam | null) =>
  team?.playoffSeed ? team.playoffSeed : Number.POSITIVE_INFINITY;

const Cell: FC<{ bet: LeaderboardEntry['divBets'][number] | undefined }> = ({
  bet,
}) => {
  const picks = [bet?.first, bet?.second, bet?.third, bet?.fourth];
  const correct = [...picks].sort(
    (a, b) => seedOf(a ?? null) - seedOf(b ?? null),
  );

  return (
    <td>
      <div class="items-center w-44">
        {picks.map((team, index) => (
          <>
            {index ? <span class="text-xs"> &gt; </span> : ''}
            <TeamLogo
              team={team ?? null}
              correct={
                !!team && !!bet?.points && team.id === correct[index]?.id
              }
            />
          </>
        ))}
      </div>
    </td>
  );
};

export const DivisionTable: FC<{ entries: LeaderboardEntry[] }> = ({
  entries,
}) => (
  <table class="table-fixed">
    <thead>
      <tr>
        <th>Name</th>
        {DIVISIONS.map((division) => (
          <th>{division}</th>
        ))}
        <th>SB</th>
        <th>Punkte</th>
      </tr>
    </thead>
    <tbody>
      {entries.map((entry) => (
        <tr>
          <td>{entry.user.name}</td>
          {DIVISIONS.map((division) => (
            <Cell bet={entry.divBets.find((bet) => bet.name === division)} />
          ))}
          <td>
            <TeamLogo
              team={
                (entry.sbBet.team as LeaderboardTeam)?.logo
                  ? (entry.sbBet.team as LeaderboardTeam)
                  : null
              }
              correct={!!entry.sbBet.points}
            />
          </td>
          <td>
            {entry.divBets.reduce((sum, bet) => sum + bet.points, 0) +
              entry.sbBet.points}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
