import type { FC } from 'hono/jsx';
import type { ScheduleGame, TeamView } from '../../schedule/query';

const IN_PROGRESS = [
  'STATUS_IN_PROGRESS',
  'STATUS_HALFTIME',
  'STATUS_END_PERIOD',
];

/** "Tipp"/"Punkte" below 720px became "T"/"P"; that is a breakpoint, not state. */
const Abbreviated: FC<{ short: string; long: string }> = ({ short, long }) => (
  <>
    <span class="md:hidden">{short}</span>
    <span class="hidden md:inline">{long}</span>
  </>
);

const Votes: FC<{
  lines: ScheduleGame['stats'];
  finished: boolean;
  points: Map<string, number>;
}> = ({ lines, finished, points }) => (
  <div
    class={`w-28 sm:w-36 md:w-60 font-xs truncate grid auto-rows-min gap-x-0.5 ${
      finished ? 'stat-grid-4' : 'stat-grid-3'
    }`}
  >
    {lines.length > 0 ? (
      <span class="col-start-3 text-center">
        <Abbreviated short="T" long="Tipp" />
      </span>
    ) : (
      ''
    )}
    {lines.length > 0 && finished ? (
      <span class="text-center">
        <Abbreviated short="P" long="Punkte" />
      </span>
    ) : (
      ''
    )}
    {lines.map((line) => (
      <>
        <span>{line.name}</span>
        <span>{line.doubler ? '🌟' : ''}</span>
        <span class="text-center">{line.bet}</span>
        {finished ? (
          <span class="text-center">{points.get(line.name) ?? 0}</span>
        ) : (
          ''
        )}
      </>
    ))}
  </div>
);

export const Stats: FC<{
  game: ScheduleGame;
  home: TeamView | undefined;
  away: TeamView | undefined;
  hidden: boolean;
  started: boolean;
  points: Map<string, number>;
}> = ({ game, home, away, hidden, started, points }) => {
  if (!started) {
    return (
      <div class="flex flex-row dark:text-gray-300">
        <div class="w-28 sm:w-36 md:w-60 px-0.5">
          <div>
            {game.awayVotes || '0'}{' '}
            {game.awayVotes === 1 ? 'Stimme' : 'Stimmen'}
          </div>
          {away ? (
            <div>
              W-L{(away.ties ?? 0) > 0 ? '-T' : ''}: {away.wins}-{away.losses}
              {(away.ties ?? 0) > 0 ? `-${away.ties}` : ''}
            </div>
          ) : (
            ''
          )}
        </div>
        <div class="flex items-center justify-center w-16 mx-1 sm:w-20" />
        <div class="w-28 sm:w-36 md:w-60 px-0.5">
          <div>
            {game.homeVotes || '0'}{' '}
            {game.homeVotes === 1 ? 'Stimme' : 'Stimmen'}
          </div>
          {home ? (
            <div>
              W-L{(home.ties ?? 0) > 0 ? '-T' : ''}: {home.wins}-{home.losses}
              {(home.ties ?? 0) > 0 ? `-${home.ties}` : ''}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }

  const finished = !hidden && game.status === 'STATUS_FINAL';
  const wonBy = Math.abs(game.homeScore - game.awayScore) || 0;
  const homeWon = game.homeScore > game.awayScore;
  const awayWon = game.awayScore > game.homeScore;
  const order = (a: { bet: number; name: string }, b: typeof a) =>
    finished
      ? (points.get(b.name) ?? 0) - (points.get(a.name) ?? 0)
      : b.bet - a.bet;

  return (
    <div class="flex flex-row leading-tight text-gray-800 dark:text-gray-300 font-xs">
      <Votes
        lines={game.stats.filter((s) => s.winner === 'away').sort(order)}
        finished={finished}
        points={points}
      />
      <div class="flex items-center justify-center w-16 mx-1 sm:w-20">
        {finished && awayWon ? '< ' : ''}
        {finished ? wonBy : ''}
        {finished && homeWon ? ' >' : ''}
      </div>
      <Votes
        lines={game.stats.filter((s) => s.winner === 'home').sort(order)}
        finished={finished}
        points={points}
      />
    </div>
  );
};

export { IN_PROGRESS };
