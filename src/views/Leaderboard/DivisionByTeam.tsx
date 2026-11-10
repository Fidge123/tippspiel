import type { FC } from 'hono/jsx';
import { imageUrl } from '../../config';
import type { LeaderboardTeam } from '../../leaderboard/query';

interface AnonymousBets {
  division: {
    firstId: string | null;
    secondId: string | null;
    thirdId: string | null;
    fourthId: string | null;
  }[];
  sb: { teamId: string | null }[];
}

export const DivisionByTeam: FC<{
  divisions: { name: string; teams: LeaderboardTeam[] }[];
  bets: AnonymousBets;
}> = ({ divisions, bets }) => {
  const picks = (
    teamId: string,
    slot: keyof AnonymousBets['division'][number],
  ) => bets.division.filter((bet) => bet[slot] === teamId).length;

  return (
    <>
      {divisions.map((division) => (
        <table class="table-fixed">
          <thead>
            <tr class="thead">
              <th>{division.name}</th>
              <th class="w-12 sm:hidden">1.</th>
              <th class="w-12 sm:hidden">2.</th>
              <th class="w-12 sm:hidden">3.</th>
              <th class="w-12 sm:hidden">4.</th>
              <th class="hidden w-20 sm:table-cell">Erster</th>
              <th class="hidden w-20 sm:table-cell">Zweiter</th>
              <th class="hidden w-20 sm:table-cell">Dritter</th>
              <th class="hidden w-20 sm:table-cell">Vierter</th>
              <th class="w-12 sm:w-20">SB</th>
            </tr>
          </thead>
          <tbody>
            {division.teams.map((team) => (
              <tr>
                <td class="w-32 truncate sm:w-36 md:w-40">
                  <img
                    src={`${imageUrl}${team.logo}`}
                    class="inline-block p-1"
                    width="32"
                    height="32"
                    alt={team.name}
                  />
                  {team.shortName}
                </td>
                <td>{picks(team.id, 'firstId')}</td>
                <td>{picks(team.id, 'secondId')}</td>
                <td>{picks(team.id, 'thirdId')}</td>
                <td>{picks(team.id, 'fourthId')}</td>
                <td>
                  {bets.sb.filter((bet) => bet.teamId === team.id).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </>
  );
};
