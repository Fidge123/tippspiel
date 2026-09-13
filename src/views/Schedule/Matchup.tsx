import type { FC } from 'hono/jsx';
import { basePath } from '../../config';
import { gamePoints } from '../../scoring';
import type { ScheduleGame, TeamView } from '../../schedule/query';
import { IN_PROGRESS, Stats } from './Stats';
import { TeamButton } from './TeamButton';

const STAKES = [1, 2, 3, 4, 5];

function pointsByPlayer(game: ScheduleGame): Map<string, number> {
  const allBets = game.stats.map((line) => ({ winner: line.winner }));

  return new Map(
    game.stats.map((line) => [
      line.name,
      gamePoints({
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        bet: { winner: line.winner, pointDiff: line.bet },
        allBets,
        doubled: line.doubler,
      }),
    ]),
  );
}

export const Matchup: FC<{
  game: ScheduleGame;
  weekId: string;
  leagueId: string;
  home: TeamView | undefined;
  away: TeamView | undefined;
  hidden: boolean;
  doublerGameId: string | null;
  doublerLocked: boolean;
  now: Date;
  error?: string;
}> = ({
  game,
  weekId,
  leagueId,
  home,
  away,
  hidden,
  doublerGameId,
  doublerLocked,
  now,
  error,
}) => {
  const started = now >= game.date;
  const inProgress = IN_PROGRESS.includes(game.status);
  const final = game.status === 'STATUS_FINAL';
  const showScore = !hidden && (inProgress || final);
  const homeWon = game.homeScore > game.awayScore;
  const awayWon = game.awayScore > game.homeScore;
  const isDoubled = doublerGameId === game.id;

  if (game.status === 'STATUS_CANCELED') {
    return (
      <div class="py-1 w-fit" id={`game-${game.id}`}>
        <div class="flex items-center w-16 sm:w-20">CANCELED</div>
      </div>
    );
  }

  return (
    <div class="py-1 w-fit" id={`game-${game.id}`}>
      <form method="post" action={`${basePath}/bet`} class="flex items-start">
        <input type="hidden" name="game" value={game.id} />
        <input type="hidden" name="league" value={leagueId} />
        <input type="hidden" name="week" value={weekId} />

        <TeamButton
          team={away}
          side="away"
          selected={game.myWinner === 'away'}
          disabled={started}
        />

        <div class="flex items-center w-16 text-gray-700 sm:w-20 dark:text-gray-200">
          <span
            class={`sm:w-6 text-center m-auto ${awayWon ? 'font-extrabold' : ''} ${
              final && game.myWinner === 'away' && awayWon
                ? 'text-green-500'
                : ''
            } ${inProgress ? 'italic' : ''}`}
          >
            {showScore ? game.awayScore : ''}
          </span>
          {started || doublerLocked ? (
            <span
              role="img"
              aria-label={isDoubled ? 'Doppler' : 'kein Doppler'}
            >
              {isDoubled ? '🌟' : '@'}
            </span>
          ) : (
            <label class="cursor-pointer" title="Doppler">
              <input
                type="radio"
                form={`doubler-${weekId}`}
                name="game"
                value={game.id}
                checked={isDoubled}
                class="sr-only"
                aria-label={`Doppler auf ${away?.name ?? 'away'} gegen ${home?.name ?? 'home'}`}
              />
              <span>{isDoubled ? '🌟' : '@'}</span>
            </label>
          )}
          <span
            class={`sm:w-6 text-center m-auto ${homeWon ? 'font-extrabold' : ''} ${
              final && game.myWinner === 'home' && homeWon
                ? 'text-green-500'
                : ''
            } ${inProgress ? 'italic' : ''}`}
          >
            {showScore ? game.homeScore : ''}
          </span>
        </div>

        <TeamButton
          team={home}
          side="home"
          selected={game.myWinner === 'home'}
          disabled={started}
        />

        <select
          name="pointDiff"
          class="h-10 w-11 ml-1 p-px text-center border-gray-700 rounded"
          disabled={started}
          aria-label="Einsatz"
        >
          {STAKES.map((stake) => (
            <option value={stake} selected={game.myPointDiff === stake}>
              {stake}
            </option>
          ))}
        </select>

        {started ? (
          ''
        ) : (
          <button type="submit" class="ml-1 h-10">
            OK
          </button>
        )}
      </form>

      {error ? <p class="text-red-600">{error}</p> : ''}

      <details>
        <summary class="cursor-pointer text-xs">Details</summary>
        <Stats
          game={game}
          home={home}
          away={away}
          hidden={hidden}
          started={started}
          points={pointsByPlayer(game)}
        />
      </details>
    </div>
  );
};
