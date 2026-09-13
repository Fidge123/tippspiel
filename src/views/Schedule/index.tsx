import type { FC } from 'hono/jsx';
import type { ScheduleWeekView, TeamView } from '../../schedule/query';
import { Week } from './Week';

export const Schedule: FC<{
  weeks: ScheduleWeekView[];
  leagueId: string;
  teams: Map<string, TeamView>;
  hidden: Record<string, boolean>;
  hideByDefault: boolean;
  now: Date;
  errors: Map<string, string>;
}> = ({ weeks, leagueId, teams, hidden, hideByDefault, now, errors }) => (
  <div class="grid px-1 pb-8 gap-x-2 sm:gap-x-4 grid-fill-23 sm:grid-fill-27 md:grid-fill-45 gap-y-12 justify-items-center min-w-min">
    {weeks.map((week) => (
      <Week
        week={week}
        leagueId={leagueId}
        teams={teams}
        hidden={hidden[week.id] ?? hideByDefault}
        now={now}
        errors={errors}
      />
    ))}
  </div>
);
