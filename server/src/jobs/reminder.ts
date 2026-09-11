import { season } from '../config';
import { db } from '../db/kysely';
import { sendEmail } from '../email/send';
import { loadHTML, loadTXT } from '../email/templates';
import { gamesWithoutBets } from './missing-bets';

const THIRTY_FOUR_HOURS = 34 * 60 * 60 * 1000;

function formatKickoff(date: Date): string {
  return date.toLocaleString('de', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * The season it reminds for comes from config rather than a literal, so the
 * reminder does not go quiet the year nobody remembers to edit it (#42).
 */
export async function betReminder(year: number = season): Promise<void> {
  const now = new Date();
  const soon = new Date(now.getTime() + THIRTY_FOUR_HOURS);

  const users = await db()
    .selectFrom('user')
    .select(['id', 'name', 'email', 'settings'])
    .where('verified', '=', true)
    .execute();

  const games = await db()
    .selectFrom('game')
    .innerJoin('team as home', 'home.id', 'game.homeTeamId')
    .innerJoin('team as away', 'away.id', 'game.awayTeamId')
    .select([
      'game.id as id',
      'game.date as date',
      'home.name as homeName',
      'away.name as awayName',
    ])
    .where('game.status', '=', 'STATUS_SCHEDULED')
    .where('game.date', '>', now)
    .where('game.date', '<=', soon)
    .execute();

  if (!games.length) {
    return;
  }

  for (const user of users) {
    const settings = (user.settings ?? {}) as { sendReminder?: boolean };
    if (!(settings.sendReminder ?? true)) {
      continue;
    }

    const leagues = await db()
      .selectFrom('league')
      .innerJoin('member', 'member.leagueId', 'league.id')
      .select('league.id as id')
      .where('member.userId', '=', user.id)
      .where('league.season', '=', year)
      .execute();

    const bets = await db()
      .selectFrom('bet')
      .select(['gameId', 'leagueId'])
      .where('userId', '=', user.id)
      .where(
        'gameId',
        'in',
        games.map((g) => g.id),
      )
      .execute();

    const missing = gamesWithoutBets(
      games,
      bets.map((b) => ({
        game: { id: b.gameId ?? '' },
        league: { id: b.leagueId ?? '' },
      })),
      leagues,
    );

    if (!missing.length) {
      continue;
    }

    const count = missing.length > 1 ? `${missing.length} Spiele` : 'ein Spiel';
    await sendEmail({
      to: user.email,
      subject: `Du hast ${count} noch nicht getippt`,
      text: await loadTXT('betReminder', {
        name: user.name,
        list: missing
          .map(
            (game) =>
              `  - ${game.awayName} @ ${game.homeName} (${formatKickoff(game.date)})`,
          )
          .join('\n'),
      }),
      html: await loadHTML('betReminder', {
        name: user.name,
        count,
        list: missing
          .map(
            (game) =>
              `    <li>${game.awayName} @ ${game.homeName} (${formatKickoff(game.date)})</li>`,
          )
          .join('\n'),
      }),
    }).catch((error) => console.error(error));
  }
}
