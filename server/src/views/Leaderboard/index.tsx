import type { FC, PropsWithChildren } from 'hono/jsx';
import { basePath } from '../../config';
import type { Leaderboard as Board } from '../../leaderboard/build';
import type { LeaderboardTeam, ScheduleWeek } from '../../leaderboard/query';
import { ByPoints } from './ByPoints';
import { ByTeam } from './ByTeam';
import { ByWeek } from './ByWeek';
import { DivisionByTeam } from './DivisionByTeam';
import { DivisionTable } from './DivisionTable';
import { OverviewTable } from './OverviewTable';

/** The SPA toggled these with useState; details needs no script. */
const Toggle: FC<PropsWithChildren<{ label: string; inline?: boolean }>> = ({
  label,
  inline,
  children,
}) => (
  <details>
    <summary class={inline ? 'inline pr-4 cursor-pointer' : 'cursor-pointer'}>
      {label}
    </summary>
    <div class="pt-4">{children}</div>
  </details>
);

const LeagueSwitcher: FC<{
  leagues: { id: string; name: string; season: number }[];
  current: string;
}> = ({ leagues, current }) => (
  <form method="get" action={`${basePath}/leaderboard`} class="space-x-2">
    <label for="league-select">Liga</label>
    <select id="league-select" name="league" class="px-2">
      {leagues.map((league) => (
        <option value={league.id} selected={league.id === current}>
          {league.name} ({league.season})
        </option>
      ))}
    </select>
    <button type="submit">Wechseln</button>
  </form>
);

export const Leaderboard: FC<{
  board: Board;
  leagues: { id: string; name: string; season: number }[];
  weeks: ScheduleWeek[];
  teams: LeaderboardTeam[];
  divisions: { name: string; teams: LeaderboardTeam[] }[];
  anonymous: Parameters<typeof DivisionByTeam>[0]['bets'];
}> = ({ board, leagues, weeks, teams, divisions, anonymous }) => (
  <div class="w-full p-4 overflow-auto h-content">
    <section class="mb-8 space-y-4 w-max">
      <h1 class="text-xl">Punktetabelle</h1>
      {leagues.length > 1 ? (
        <LeagueSwitcher leagues={leagues} current={board.league.id} />
      ) : (
        ''
      )}
      <OverviewTable entries={board.entries} />
    </section>
    <section class="mb-8 space-y-4 w-max">
      <h1 class="text-xl">Pre-Season Tipps</h1>
      <p class="w-[35ch] sm:w-[48ch]">
        Tipps für die Divisions werden zum Start der Post-Season für alle
        aufgedeckt. Icons mit grünem Rahmen sind korrekt und geben Punkte.
      </p>
      <Toggle label="Divisions">
        <DivisionTable entries={board.entries} />
      </Toggle>
    </section>
    <section class="mb-8 space-y-4 w-max">
      <h1 class="text-xl">Statistik</h1>
      <p class="w-[35ch] sm:w-[48ch]">
        Statistiken werden im Format "Korrekte Tipps - Falsche Tipps -
        Unentschieden" angezeigt. Es werden nur abgeschlossene Spiele in die
        Statistik einbezogen.
      </p>
      <article>
        <Toggle label="Einsatz" inline>
          <ByPoints entries={board.entries} />
        </Toggle>
      </article>
      <article>
        <Toggle label="Woche" inline>
          <ByWeek entries={board.entries} weeks={weeks} />
        </Toggle>
      </article>
      <article>
        <Toggle label="Team" inline>
          <ByTeam entries={board.entries} teams={teams} weeks={weeks} />
        </Toggle>
      </article>
      <article>
        <Toggle label="Division-Tipps" inline>
          <DivisionByTeam divisions={divisions} bets={anonymous} />
        </Toggle>
      </article>
    </section>
  </div>
);
