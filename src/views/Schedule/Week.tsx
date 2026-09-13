import type { FC } from 'hono/jsx';
import { basePath } from '../../config';
import type { ScheduleWeekView, TeamView } from '../../schedule/query';
import { Matchup } from './Matchup';

function formatDate(date: Date): string {
  return date.toLocaleString('de', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  });
}

export const Week: FC<{
  week: ScheduleWeekView;
  leagueId: string;
  teams: Map<string, TeamView>;
  hidden: boolean;
  now: Date;
  errors: Map<string, string>;
}> = ({ week, leagueId, teams, hidden, now, errors }) => {
  const doubledGame = week.games.find((g) => g.id === week.doublerGameId);
  const doublerLocked = !!doubledGame && now >= doubledGame.date;
  const kickoffs = [
    ...new Set(week.games.map((game) => game.date.getTime())),
  ].sort((a, b) => a - b);

  return (
    <article class="pt-4" id={`week-${week.id}`}>
      <hgroup class="flex justify-between pr-6">
        <h1 class="text-2xl truncate dark:text-gray-100 w-52 sm:w-64 md:w-80">
          {week.label}
        </h1>
        {now > week.start ? (
          <form method="post" action={`${basePath}/hidden`}>
            <input type="hidden" name="week" value={week.id} />
            <input type="hidden" name="hidden" value={hidden ? 'off' : 'on'} />
            <button
              type="submit"
              class={`border border-gray-800 dark:border-black rounded ${
                hidden
                  ? 'text-white dark:text-white bg-gray-600 dark:bg-gray-900'
                  : 'text-gray-800 dark:text-gray-900 bg-gray-100 dark:bg-gray-400'
              }`}
            >
              Spoilerschutz {hidden ? 'an' : 'aus'}
            </button>
          </form>
        ) : (
          ''
        )}
      </hgroup>

      {week.byes.length > 0 ? (
        <div class="pb-1.5 max-w-fit dark:text-gray-300">
          Bye: {week.byes.join(', ')}
        </div>
      ) : (
        ''
      )}

      {kickoffs.map((time) => (
        <section>
          <h1 class="text-gray-400 py-0.5 leading-none">
            <time dateTime={new Date(time).toISOString()}>
              {formatDate(new Date(time))}
            </time>
          </h1>
          {week.games
            .filter((game) => game.date.getTime() === time)
            .map((game) => (
              <Matchup
                game={game}
                weekId={week.id}
                leagueId={leagueId}
                home={teams.get(game.homeTeamId ?? '')}
                away={teams.get(game.awayTeamId ?? '')}
                hidden={hidden}
                doublerGameId={week.doublerGameId}
                doublerLocked={doublerLocked}
                now={now}
                error={errors.get(game.id)}
              />
            ))}
        </section>
      ))}

      {/* The doubler radios above belong to this form through their form
          attribute, because a form cannot be nested inside the per-game ones. */}
      <form
        method="post"
        action={`${basePath}/doubler`}
        id={`doubler-${week.id}`}
        class="pt-2 space-x-2"
      >
        <input type="hidden" name="week" value={week.id} />
        <input type="hidden" name="league" value={leagueId} />
        {doublerLocked ? (
          <span class="text-xs text-gray-500">
            Doppler gesetzt, das Spiel hat begonnen.
          </span>
        ) : (
          <>
            <button type="submit">Doppler setzen</button>
            {week.doublerGameId ? (
              <button
                type="submit"
                formaction={`${basePath}/doubler/remove`}
                formnovalidate
              >
                Doppler entfernen
              </button>
            ) : (
              ''
            )}
          </>
        )}
      </form>
    </article>
  );
};
